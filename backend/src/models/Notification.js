// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['invite', 'merge_request', 'merge_accepted', 'merge_rejected', 'mention', 'project_update'],
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  read: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: true,
  },
  link: String, // e.g. /projects/:id/merge-requests/:mrId
  data: mongoose.Schema.Types.Mixed, // extra payload (e.g. mergeRequestId)
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);