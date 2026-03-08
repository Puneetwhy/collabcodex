// backend/src/socket/events.js
const jwt = require('jsonwebtoken');
const ProjectMember = require('../models/ProjectMember');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const UserDraft = require('../models/UserDraft');
const TerminalService = require('../services/terminalService');
const { ROLES } = require('../constants/roles');

module.exports = (io) => {
  const userSocketMap = new Map();

  // JWT Auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (${socket.id})`);

    // ====================== FILE / FOLDER MANAGEMENT ======================
    socket.on('create-item', async ({ projectId, path, type, content = '' }) => {
      try {
        const membership = await ProjectMember.findOne({
          project: projectId,
          user: socket.userId,
          status: 'active',
        });

        if (!membership || (type === 'file' && membership.role === ROLES.VIEWER)) {
          socket.emit('error', { message: 'Permission denied' });
          return;
        }

        // Ensure draft exists
        let draft = await UserDraft.findOne({ user: socket.userId, project: projectId });
        if (!draft) {
          draft = await UserDraft.create({
            user: socket.userId,
            project: projectId,
            files: new Map(),
          });
        }

        // Map update
        draft.files.set(path, type === 'file' ? content : null);
        draft.lastSyncedAt = new Date();
        await draft.save();

        io.to(`project-${projectId}`).emit('draft-update', { files: Object.fromEntries(draft.files) });
        socket.emit('item-created', { path, type });
      } catch (err) {
        console.error('Create item error:', err);
        socket.emit('error', { message: 'Create failed' });
      }
    });

    socket.on('rename-item', async ({ projectId, oldPath, newPath }) => {
      try {
        const draft = await UserDraft.findOne({ user: socket.userId, project: projectId });
        if (!draft || !draft.files.has(oldPath)) {
          return socket.emit('error', { message: 'Item not found' });
        }

        const content = draft.files.get(oldPath);
        draft.files.delete(oldPath);
        draft.files.set(newPath, content);
        draft.lastSyncedAt = new Date();
        await draft.save();

        io.to(`project-${projectId}`).emit('draft-update', { files: Object.fromEntries(draft.files) });
        socket.emit('item-renamed', { oldPath, newPath });
      } catch (err) {
        console.error('Rename item error:', err);
        socket.emit('error', { message: 'Rename failed' });
      }
    });

    socket.on('delete-item', async ({ projectId, path }) => {
      try {
        const draft = await UserDraft.findOne({ user: socket.userId, project: projectId });
        if (!draft || !draft.files.has(path)) {
          return socket.emit('error', { message: 'Item not found' });
        }

        draft.files.delete(path);
        draft.lastSyncedAt = new Date();
        await draft.save();

        io.to(`project-${projectId}`).emit('draft-update', { files: Object.fromEntries(draft.files) });
        socket.emit('item-deleted', { path });
      } catch (err) {
        console.error('Delete item error:', err);
        socket.emit('error', { message: 'Delete failed' });
      }
    });

    // ====================== UPLOAD FOLDER ======================
    socket.on('upload-folder', async ({ projectId, items }) => {
      try {
        const membership = await ProjectMember.findOne({ project: projectId, user: socket.userId, status: 'active' });
        if (!membership) return socket.emit('error', { message: 'Permission denied' });

        let draft = await UserDraft.findOne({ user: socket.userId, project: projectId });
        if (!draft) {
          draft = await UserDraft.create({ user: socket.userId, project: projectId, files: new Map() });
        }

        for (const { path, content } of items) {
          draft.files.set(path, content);
        }
        draft.lastSyncedAt = new Date();
        await draft.save();

        io.to(`project-${projectId}`).emit('draft-update', { files: Object.fromEntries(draft.files) });
        socket.emit('folder-uploaded', { success: true });
      } catch (err) {
        console.error('Folder upload error:', err);
        socket.emit('error', { message: 'Folder upload failed' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.userId} (${socket.id})`);
      userSocketMap.delete(socket.userId);
    });
  });
};