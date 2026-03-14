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
    enum: ['public', 'private'],
    default: 'private',
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  mainFiles: {
    type: Map,
    of: String,
    default: () => new Map([['README.md', '# Welcome to your CollabCodeX project\n\nStart coding! 🚀']]),
  },

  language: {
    type: String,
    enum: ['javascript', 'nodejs', 'python', 'java', 'other'],
    default: 'javascript',
    lowercase: true,
  },

  memberCount: {
    type: Number,
    default: 1,
    min: 1,
  },

  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
projectSchema.index({ owner: 1, name: 1 }, { unique: true });
projectSchema.index({ visibility: 1, language: 1 });
projectSchema.index({ lastActivity: -1 });

// Virtuals
projectSchema.virtual('pendingRequests', {
  ref: 'MergeRequest',
  localField: '_id',
  foreignField: 'project',
  justOne: false,
  match: { status: 'open' },
});

// Pre-save hook
projectSchema.pre('save', function (next) {
  this.lastActivity = Date.now();
  if (this.memberCount < 1) this.memberCount = 1;
  next();
});

// Methods
projectSchema.methods.hasAccess = async function (userId) {
  if (this.owner.toString() === userId.toString()) return true;
  const member = await mongoose.model('ProjectMember').findOne({
    project: this._id,
    user: userId,
    status: 'active',
  });
  return !!member;
};

// Statics
projectSchema.statics.findAccessible = async function (userId) {
  const own = await this.find({ owner: userId });
  const joined = await mongoose.model('ProjectMember')
    .find({ user: userId, status: 'active' })
    .populate('project')
    .then(members => members.map(m => m.project));
  const publicProjects = await this.find({ visibility: 'public' });

  const all = [...own, ...joined, ...publicProjects];
  const unique = Array.from(new Map(all.map(p => [p._id.toString(), p])).values());

  return unique;
};

module.exports = mongoose.model('Project', projectSchema);