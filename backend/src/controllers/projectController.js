// backend/src/controllers/projectController.js
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');
const Notification = require('../models/Notification');
const DockerService = require('../services/dockerService');
const { ROLES } = require('../constants/roles');
const archiver = require('archiver');

// ---------------------------
// CREATE NEW PROJECT
// ---------------------------
const createProject = async (req, res) => {
  const { name, description = '', visibility = 'private', language = 'javascript' } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  try {
    // Check if project with same name exists for this owner
    const existing = await Project.findOne({ owner: req.user._id, name });
    if (existing) {
      return res.status(400).json({ message: 'You already have a project with this name' });
    }

    const project = await Project.create({
      name,
      description,
      visibility,
      language,
      owner: req.user._id,
      mainFiles: new Map([['README.md', '# Welcome to your CollabCodeX project']]),
    });

    // Add owner as first member
    await ProjectMember.create({
      project: project._id,
      user: req.user._id,
      role: ROLES.OWNER,
      status: 'active',
      joinedAt: new Date(),
    });

    return res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    return res.status(500).json({ message: 'Error creating project' });
  }
};

// ---------------------------
// GET MY PROJECTS
// ---------------------------
const getMyProjects = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: 'Unauthorized: user not found' });
  }

  try {
    const owned = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    const memberships = await ProjectMember.find({
      user: req.user._id,
      status: 'active',
    }).populate('project');

    const joined = memberships.map(m => m.project);
    const allProjects = [...owned, ...joined.filter(j => !owned.some(o => o._id.equals(j._id)))];

    res.json(allProjects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// ---------------------------
// GET SINGLE PROJECT
// ---------------------------
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const membership = await ProjectMember.findOne({
      project: project._id,
      user: req.user._id,
      status: 'active',
    });

    if (!membership && project.visibility !== 'public') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const members = await ProjectMember.find({ project: project._id, status: 'active' })
      .populate('user', 'username avatar email');

    res.json({
      ...project.toObject(),
      members,
      myRole: membership?.role || 'viewer',
    });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// ---------------------------
// UPDATE PROJECT (OWNER ONLY)
// ---------------------------
const updateProject = async (req, res) => {
  const { name, description, visibility } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    if (name?.trim()) project.name = name.trim();
    if (description !== undefined) project.description = description;
    if (visibility && ['public', 'private'].includes(visibility)) project.visibility = visibility;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Error updating project' });
  }
};

// ---------------------------
// DELETE PROJECT (OWNER ONLY)
// ---------------------------
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await DockerService.cleanupProject(req.params.id);
    await ProjectMember.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Error deleting project' });
  }
};

// ---------------------------
// INVITE USER TO PROJECT
// ---------------------------
const inviteToProject = async (req, res) => {
  const { email } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can invite' });
    }

    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ message: 'User with this email not found' });

    const existing = await ProjectMember.findOne({ project: project._id, user: invitee._id });
    if (existing) return res.status(400).json({ message: 'User is already a member or invited' });

    await ProjectMember.create({
      project: project._id,
      user: invitee._id,
      role: ROLES.EDITOR,
      status: 'invited',
    });

    await Notification.create({
      user: invitee._id,
      type: 'invite',
      project: project._id,
      fromUser: req.user._id,
      message: `${req.user.username} invited you to collaborate on "${project.name}"`,
      link: `/projects/${project._id}?tab=invites`,
    });

    res.json({ message: 'Invitation sent' });
  } catch (err) {
    console.error('Error sending invitation:', err);
    res.status(500).json({ message: 'Error sending invitation' });
  }
};

// ---------------------------
// EXPORT PROJECT ZIP
// ---------------------------
const exportProject = async (req, res) => {
  const { id: projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
      status: 'active',
    });
    if (!membership) return res.status(403).json({ message: 'Access denied' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name || 'project'}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const [path, content] of project.mainFiles) {
      archive.append(content, { name: path });
    }

    archive.append(
      JSON.stringify({
        name: project.name,
        description: project.description,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }, null, 2),
      { name: 'project-metadata.json' }
    );

    await archive.finalize();
  } catch (err) {
    console.error('Error exporting project:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Export failed' });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteToProject,
  exportProject,
};