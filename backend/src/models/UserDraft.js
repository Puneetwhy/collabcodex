// backend/src/models/UserDraft.js
const mongoose = require('mongoose');

const userDraftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  files: {
    type: Map,
    of: String, // path -> content (user's personal working copy)
    default: () => new Map(),
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: track base version this draft is from
  baseVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectVersion',
  },
}, { timestamps: true });

userDraftSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('UserDraft', userDraftSchema);