// backend/src/controllers/chatController.js
const ChatMessage = require('../models/ChatMessage');
const ProjectMember = require('../models/ProjectMember');
const Notification = require('../models/Notification');

const getChatHistory = async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 50, before } = req.query;

  try {
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
      status: 'active',
    });

    if (!membership) return res.status(403).json({ message: 'Access denied' });

    const query = { project: projectId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await ChatMessage.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ project: projectId });

    res.json({
      messages: messages.reverse(),
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

const postChatMessage = async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ message: 'Message required' });

  try {
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
      status: 'active',
    });

    if (!membership) return res.status(403).json({ message: 'Access denied' });

    const message = await ChatMessage.create({
      project: projectId,
      user: req.user._id,
      content: content.trim(),
      type: 'user',
    });

    await message.populate('user', 'username avatar');

    req.io?.to(`project-${projectId}`).emit('chat-message', message);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message' });
  }
};

const sendSystemMessage = async (projectId, content) => {
  try {
    const message = await ChatMessage.create({
      project: projectId,
      user: null,
      content,
      type: 'system',
    });

    req.io?.to(`project-${projectId}`).emit('chat-message', message);
    return message;
  } catch (err) {
    console.error('System message error:', err);
  }
};

module.exports = {
  getChatHistory,
  postChatMessage,
  sendSystemMessage,
};