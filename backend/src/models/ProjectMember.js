const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'editor',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'invited', 'pending', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

// Compound index: a user can only have one record per project
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

// Index to quickly query all members by role in a project
projectMemberSchema.index({ project: 1, role: 1 });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);