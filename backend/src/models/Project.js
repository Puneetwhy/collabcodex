const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Use object instead of Map to support filenames like "README.md"
  mainFiles: {
    type: Object, // filename -> content
    default: { "README.md": "# Welcome to your CollabCodeX project" },
  },
  language: {
    type: String,
    enum: ['javascript', 'nodejs', 'python', 'java', 'other'],
    default: 'javascript',
  },
  // Quick lookup of members
  memberCount: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

// Compound index: owner + project name must be unique
projectSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);