// backend/src/controllers/chatController.js
const ChatMessage = require('../models/ChatMessage');
const ProjectMember = require('../models/ProjectMember');
const Notification = require('../models/Notification');

// Get chat history for a project (paginated, newest first)
const getChatHistory = async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 50, before = null } = req.query;

  try {
    // Verify user is member (viewer or higher)
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
      status: 'active',
    });

    if (!membership) {
      return res.status(403).json({ message: 'You do not have access to this project chat' });
    }

    const query = { project: projectId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ project: projectId });

    res.json({
      messages: messages.reverse(), // oldest → newest for frontend
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      hasMore: messages.length === parseInt(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

// Post a new chat message (fallback when socket is not available)
const postChatMessage = async (req, res) => {
  const { projectId } = req.params;
  const { content, type = 'user' } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    // Verify membership
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
      status: 'active',
    });

    if (!membership) {
      return res.status(403).json({ message: 'You do not have permission to chat here' });
    }

    const message = await ChatMessage.create({
      project: projectId,
      user: req.user._id,
      content: content.trim(),
      type,
    });

    await message.populate('user', 'username avatar');

    // Broadcast via socket (if socket server is accessible)
    req.io?.to(`project-${projectId}`).emit('chat-message', message);

    // Optional: notify mentioned users (simple @username detection)
    const mentions = content.match(/@(\w+)/g) || [];
    if (mentions.length > 0) {
      // Future: find users by username, send notification
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Helper: Send system message (called from other controllers, e.g. merge accept)
const sendSystemMessage = async (projectId, content) => {
  try {
    const message = await ChatMessage.create({
      project: projectId,
      user: null, // system
      content,
      type: 'system',
    });

    req.io?.to(`project-${projectId}`).emit('chat-message', message);
    return message;
  } catch (err) {
    console.error('Failed to send system message:', err);
  }
};

module.exports = {
  getChatHistory,
  postChatMessage,
  sendSystemMessage,
};