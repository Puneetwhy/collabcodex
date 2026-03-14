// backend/src/models/MergeRequest.js
const mongoose = require('mongoose');

const mergeRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['open', 'merged', 'closed', 'draft'],
    default: 'open',
  },
  diff: {
    type: String,
    required: true,
  },
  filesChanged: {
    type: [String],
  },
  reviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  approvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  mergedAt: Date,
  closedAt: Date,
}, { timestamps: true });

mergeRequestSchema.index({ project: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('MergeRequest', mergeRequestSchema);