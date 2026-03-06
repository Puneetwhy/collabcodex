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
  // Use object instead of Map to support filenames with dots
  files: {
    type: Object, // snapshot of mainFiles at this version
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
  // Optional: linked merge request that created this version
  mergeRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MergeRequest',
  },
}, { timestamps: true });

// Fast lookup of latest versions
projectVersionSchema.index({ project: 1, versionNumber: -1 });

module.exports = mongoose.model('ProjectVersion', projectVersionSchema);