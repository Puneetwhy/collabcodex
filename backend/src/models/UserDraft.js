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
    of: String,
    default: () => new Map(),
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
  baseVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectVersion',
  },
}, { timestamps: true });

userDraftSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('UserDraft', userDraftSchema);