// backend/src/controllers/collaborationController.js
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Notification = require('../models/Notification');
const { ROLES } = require('../constants/roles');
const asyncHandler = require('express-async-handler');

// ========================
// Invitations
// ========================

// Accept project invitation (user accepts their own invite)
const acceptInvite = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;

  const membership = await ProjectMember.findOne({
    _id: membershipId,
    user: req.user._id,
    status: 'invited',
  });

  if (!membership) return res.status(404).json({ message: 'Invitation not found or already processed' });

  membership.status = 'active';
  membership.joinedAt = new Date();
  await membership.save();

  await Project.findByIdAndUpdate(membership.project, { $inc: { memberCount: 1 } });

  const project = await Project.findById(membership.project);
  await Notification.create({
    user: project.owner,
    type: 'project_update',
    project: project._id,
    fromUser: req.user._id,
    message: `${req.user.username} accepted your invitation to "${project.name}"`,
    link: `/projects/${project._id}/settings`,
  });

  req.io?.to(`project-${project._id}`).emit('chat-message', {
    type: 'system',
    content: `${req.user.username} joined the project`,
  });

  res.json({ success: true, message: 'Joined project successfully' });
});

// Reject project invitation
const rejectInvite = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;

  const membership = await ProjectMember.findOneAndDelete({
    _id: membershipId,
    user: req.user._id,
    status: 'invited',
  });

  if (!membership) return res.status(404).json({ message: 'Invitation not found or already processed' });

  const project = await Project.findById(membership.project);
  await Notification.create({
    user: project.owner,
    type: 'project_update',
    project: project._id,
    fromUser: req.user._id,
    message: `${req.user.username} declined your invitation to "${project.name}"`,
  });

  res.json({ success: true, message: 'Invitation rejected' });
});

// Get pending invites for the logged-in user
const getPendingInvites = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const pendingInvites = await ProjectMember.find({
    user: userId,
    status: 'invited',
  })
    .populate('project', 'name owner')
    .populate('project.owner', 'username email');

  res.json(pendingInvites);
});

// ========================
// Member Management
// ========================

// Update member role (owner only)
const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const project = await Project.findById(projectId);
  if (!project || project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only project owner can change roles' });
  }

  const member = await ProjectMember.findOne({
    _id: memberId,
    project: projectId,
    status: 'active',
  });

  if (!member) return res.status(404).json({ message: 'Member not found' });
  if (member.role === ROLES.OWNER) return res.status(403).json({ message: 'Cannot change owner role' });

  member.role = role;
  await member.save();

  res.json({ success: true, message: `Role updated to ${role}` });
});

// Remove/kick member (owner or self-remove)
const removeMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const membership = await ProjectMember.findById(memberId);
  if (!membership || membership.project.toString() !== projectId) {
    return res.status(404).json({ message: 'Membership not found' });
  }

  const isSelf = membership.user.toString() === req.user._id.toString();
  const isOwner = project.owner.toString() === req.user._id.toString();

  if (!isSelf && !isOwner) return res.status(403).json({ message: 'Not authorized to remove this member' });

  await membership.deleteOne();
  await Project.findByIdAndUpdate(projectId, { $inc: { memberCount: -1 } });

  await Notification.create({
    user: membership.user,
    type: 'project_update',
    project: projectId,
    message: isSelf
      ? `You left the project "${project.name}"`
      : `You were removed from "${project.name}" by the owner`,
  });

  req.io?.to(`project-${projectId}`).emit('chat-message', {
    type: 'system',
    content: isSelf
      ? `${req.user.username} left the project`
      : `Member removed from project`,
  });

  res.json({ success: true, message: 'Member removed' });
});

// Get all members of a project
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const members = await ProjectMember.find({ project: projectId })
    .populate('user', 'username email avatar')
    .sort({ role: -1, joinedAt: 1 });

  res.json(members);
});

module.exports = {
  acceptInvite,
  rejectInvite,
  getPendingInvites, // ✅ added
  updateMemberRole,
  removeMember,
  getProjectMembers,
};