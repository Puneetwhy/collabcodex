// backend/src/models/ChatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  type: {
    type: String,
    enum: ['user', 'system'],
    default: 'user',
  },
  // For system messages (e.g. "Push accepted by @user")
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

chatMessageSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);