// backend/src/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    minlength: [3, 'Name must be at least 3 characters'],
  },

  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },

  visibility: {
    type: String,
    enum: {
      values: ['public', 'private'],
      message: '{VALUE} is not a valid visibility type',
    },
    default: 'private',
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required'],
    index: true,
  },

  // Files stored as plain object (filename → content string)
  // This is more reliable than Map for MongoDB serialization & queries
  mainFiles: {
    type: Map,
    of: String,
    default: () => new Map([['README.md', '# Welcome to your CollabCodeX project\n\nStart coding! 🚀']]),
  },

  language: {
    type: String,
    enum: {
      values: ['javascript', 'nodejs', 'python', 'java', 'other'],
      message: '{VALUE} is not a supported language',
    },
    default: 'javascript',
    lowercase: true,
  },

  // Quick count of active members (updated via hooks or controller)
  memberCount: {
    type: Number,
    default: 1,
    min: 1,
  },

  // Optional: last activity timestamp for sorting "active projects"
  lastActivity: {
    type: Date,
    default: Date.now,
  },

}, {
  timestamps: true,           // createdAt & updatedAt
  toJSON: { virtuals: true }, // include virtuals in JSON
  toObject: { virtuals: true },
});

// ====================== INDEXES ======================

// Unique constraint: one owner can't have duplicate project names
projectSchema.index({ owner: 1, name: 1 }, { unique: true });

// Fast lookup by visibility + language
projectSchema.index({ visibility: 1, language: 1 });

// ====================== VIRTUALS ======================

// Virtual: number of pending merge requests (example)
projectSchema.virtual('pendingRequests', {
  ref: 'MergeRequest',
  localField: '_id',
  foreignField: 'project',
  justOne: false,
  match: { status: 'pending' },
});

// ====================== PRE-SAVE HOOKS ======================

projectSchema.pre('save', function (next) {
  // Update lastActivity on any change
  this.lastActivity = Date.now();

  // Ensure memberCount never goes below 1 (owner always present)
  if (this.memberCount < 1) this.memberCount = 1;

  next();
});

// ====================== METHODS ======================

// Instance method: check if user has access
projectSchema.methods.hasAccess = async function (userId) {
  if (this.owner.toString() === userId.toString()) return true;

  const member = await mongoose.model('ProjectMember').findOne({
    project: this._id,
    user: userId,
    status: 'active',
  });

  return !!member;
};

// ====================== STATIC METHODS ======================

// Static method: find public projects or user's own/joined
projectSchema.statics.findAccessible = async function (userId) {
  const own = await this.find({ owner: userId });

  const joined = await mongoose.model('ProjectMember')
    .find({ user: userId, status: 'active' })
    .populate('project')
    .then(members => members.map(m => m.project));

  const publicProjects = await this.find({ visibility: 'public' });

  // Combine & remove duplicates
  const all = [...own, ...joined, ...publicProjects];
  const unique = Array.from(new Map(all.map(p => [p._id.toString(), p])).values());

  return unique;
};

module.exports = mongoose.model('Project', projectSchema);