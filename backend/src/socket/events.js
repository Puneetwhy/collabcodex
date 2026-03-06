// backend/src/socket/events.js
const jwt = require('jsonwebtoken');
const ProjectMember = require('../models/ProjectMember');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = (io) => {
  const userSocketMap = new Map(); // userId -> socket.id (for presence)

  io.use((socket, next) => {
    // JWT auth via handshake (supports both Bearer and query)
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (socket ${socket.id})`);

    // ====================== JOIN / LEAVE PROJECT ======================
    socket.on('join-project', async ({ projectId }) => {
      const membership = await ProjectMember.findOne({
        project: projectId,
        user: socket.userId,
        status: 'active',
      }).populate('user', 'username avatar');

      if (!membership) {
        socket.emit('error', { message: 'You are not a member of this project' });
        return;
      }

      socket.join(`project-${projectId}`);
      userSocketMap.set(socket.userId, socket.id);

      // Broadcast updated presence
      const onlineUsers = await getOnlineUsers(projectId);
      io.to(`project-${projectId}`).emit('presence-update', onlineUsers);

      // Send previous chat history (last 100)
      const chatHistory = await ChatMessage.find({ project: projectId })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(100);

      socket.emit('chat-history', chatHistory.reverse());

      // Welcome system message
      io.to(`project-${projectId}`).emit('chat-message', {
        type: 'system',
        content: `${membership.user.username} joined the project`,
        timestamp: new Date(),
      });
    });

    socket.on('leave-project', ({ projectId }) => {
      socket.leave(`project-${projectId}`);
      userSocketMap.delete(socket.userId);

      io.to(`project-${projectId}`).emit('presence-update', []);
      // Refresh presence for remaining users
      getOnlineUsers(projectId).then(users => {
        io.to(`project-${projectId}`).emit('presence-update', users);
      });
    });

    // ====================== DRAFT SYNC (Real-time keystrokes) ======================
    socket.on('draft-update', ({ projectId, files }) => {
      // Broadcast to everyone except sender (they already have local state)
      socket.to(`project-${projectId}`).emit('draft-update', {
        userId: socket.userId,
        files, // full Map or delta – frontend decides
        timestamp: Date.now(),
      });
    });

    // In socket/events.js – add these handlers
socket.on('attach-terminal', async ({ projectId, language }) => {
  try {
    const { stream, resize } = await TerminalService.attachTerminal(projectId, language);
    
    // Pipe container output → socket
    stream.on('data', (chunk) => {
      socket.emit('terminal-output', chunk.toString());
    });

    // Pipe socket input → container
    socket.on('terminal-input', ({ data }) => {
      stream.write(data);
    });

    // Handle resize from frontend
    socket.on('terminal-resize', ({ cols, rows }) => {
      resize(cols, rows);
    });

    // Cleanup on disconnect or detach
    socket.on('detach-terminal', () => {
      stream.end();
    });
  } catch (err) {
    socket.emit('terminal-error', { message: err.message });
  }
});

socket.on('restart-terminal', async ({ projectId, language }) => {
  await TerminalService.restartTerminal(projectId, language);
  socket.emit('terminal-output', '\r\nTerminal restarted.\r\n');
});

socket.on('change-terminal-language', async ({ projectId, language }) => {
  await TerminalService.restartTerminal(projectId, language);
  socket.emit('terminal-output', `\r\nSwitched to ${language} environment.\r\n`);
});

    // ====================== CURSOR & SELECTION TRACKING ======================
    socket.on('cursor-move', ({ projectId, cursor }) => {
      socket.to(`project-${projectId}`).emit('cursor-move', {
        userId: socket.userId,
        cursor, // { line, column, color }
      });
    });

    socket.on('selection-change', ({ projectId, selection }) => {
      socket.to(`project-${projectId}`).emit('selection-change', {
        userId: socket.userId,
        selection, // { startLine, startColumn, endLine, endColumn }
      });
    });

    // ====================== CHAT ======================
    socket.on('send-chat', async ({ projectId, content }) => {
      const message = new ChatMessage({
        project: projectId,
        user: socket.userId,
        content,
        type: 'user',
      });
      await message.save();
      await message.populate('user', 'username avatar');

      io.to(`project-${projectId}`).emit('chat-message', message);
    });

    // ====================== NOTIFICATIONS (real-time) ======================
    socket.on('send-notification', async ({ userId, type, projectId, message, link, data }) => {
      const notif = new Notification({
        user: userId,
        type,
        project: projectId,
        fromUser: socket.userId,
        message,
        link,
        data,
      });
      await notif.save();

      // Emit to specific user if online
      const targetSocketId = userSocketMap.get(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', notif);
      }
    });

    // ====================== TYPING INDICATOR (nice-to-have polish) ======================
    socket.on('typing', ({ projectId, isTyping }) => {
      socket.to(`project-${projectId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // ====================== DISCONNECT ======================
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      userSocketMap.delete(socket.userId);

      // Clean up presence in all rooms user was in (Socket.io handles leave automatically)
      // Optional: broadcast global presence cleanup if needed
    });
  });

  // Helper: Get online users in a project
  async function getOnlineUsers(projectId) {
    const members = await ProjectMember.find({
      project: projectId,
      status: 'active',
    }).populate('user', 'username avatar');

    const online = members
      .filter(m => userSocketMap.has(m.user._id.toString()))
      .map(m => ({
        userId: m.user._id,
        username: m.user.username,
        avatar: m.user.avatar,
        role: m.role,
      }));

    return online;
  }
};