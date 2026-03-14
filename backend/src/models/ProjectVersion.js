// backend/src/models/ProjectVersion.js
const mongoose = require('mongoose');

const projectVersionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  files: {
    type: Object,
    required: true,
  },
  committedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    maxlength: 200,
  },
  mergeRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MergeRequest',
  },
}, { timestamps: true });

projectVersionSchema.index({ project: 1, versionNumber: -1 });

module.exports = mongoose.model('ProjectVersion', projectVersionSchema);