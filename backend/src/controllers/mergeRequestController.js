// backend/src/controllers/mergeRequestController.js
const Project = require('../models/Project');
const UserDraft = require('../models/UserDraft');
const MergeRequest = require('../models/MergeRequest');
const ProjectVersion = require('../models/ProjectVersion');
const Notification = require('../models/Notification');
const diff = require('diff');

const pushDraft = async (req, res) => {
  const { projectId, title = 'Untitled Push', description = '' } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const draft = await UserDraft.findOne({ user: req.user._id, project: projectId });
    if (!draft) return res.status(404).json({ message: 'No draft found' });

    let changes = [];
    let diffString = '';

    for (const [path, draftContent] of draft.files) {
      const mainContent = project.mainFiles.get(path) || '';
      const fileDiff = diff.createPatch(path, mainContent, draftContent, 'Main', 'Draft');
      diffString += fileDiff + '\n\n';

      const linesChanged = fileDiff.split('\n').filter(l => l.startsWith('+') || l.startsWith('-')).length;
      if (linesChanged > 0) changes.push({ path, linesChanged });
    }

    if (changes.length === 0) return res.status(400).json({ message: 'No changes to push' });

    const mergeRequest = await MergeRequest.create({
      project: projectId,
      author: req.user._id,
      title,
      description,
      diff: diffString,
      filesChanged: changes.map(c => c.path),
      status: 'open',
    });

    const members = await ProjectMember.find({
      project: projectId,
      role: { $in: ['owner', 'editor'] },
      status: 'active',
      user: { $ne: req.user._id },
    });

    for (const member of members) {
      await Notification.create({
        user: member.user,
        type: 'merge_request',
        project: projectId,
        fromUser: req.user._id,
        message: `${req.user.username} pushed changes: "${title}"`,
        link: `/projects/${projectId}/merge-requests/${mergeRequest._id}`,
      });
    }

    req.io?.to(`project-${projectId}`).emit('merge-request-created', mergeRequest);

    res.status(201).json(mergeRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Push failed' });
  }
};

const acceptMerge = async (req, res) => {
  const { projectId, mrId } = req.params;

  try {
    const mergeRequest = await MergeRequest.findById(mrId);
    if (!mergeRequest || mergeRequest.project.toString() !== projectId) {
      return res.status(404).json({ message: 'Merge request not found' });
    }

    const project = await Project.findById(projectId);
    const draft = await UserDraft.findOne({ user: mergeRequest.author, project: projectId });

    project.mainFiles = new Map(draft.files);
    await project.save();

    const version = await ProjectVersion.create({
      project: projectId,
      files: new Map(project.mainFiles),
      committedBy: req.user._id,
      message: mergeRequest.title,
      mergeRequest: mergeRequest._id,
    });

    draft.files = new Map(project.mainFiles);
    await draft.save();

    mergeRequest.status = 'merged';
    mergeRequest.mergedAt = new Date();
    mergeRequest.approvedBy = [req.user._id];
    await mergeRequest.save();

    await Notification.create({
      user: mergeRequest.author,
      type: 'merge_accepted',
      project: projectId,
      fromUser: req.user._id,
      message: `Your push "${mergeRequest.title}" was accepted`,
      link: `/projects/${projectId}`,
    });

    req.io?.to(`project-${projectId}`).emit('merge-accepted', { mergeRequestId: mrId });

    res.json({ message: 'Merged', mergeRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Merge failed' });
  }
};

const rejectMerge = async (req, res) => {
  const { projectId, mrId } = req.params;

  try {
    const mergeRequest = await MergeRequest.findById(mrId);
    if (!mergeRequest || mergeRequest.project.toString() !== projectId) return res.status(404).json({ message: 'Not found' });

    if (mergeRequest.status !== 'open') return res.status(400).json({ message: 'Already processed' });

    mergeRequest.status = 'closed';
    mergeRequest.closedAt = new Date();
    await mergeRequest.save();

    await Notification.create({
      user: mergeRequest.author,
      type: 'merge_rejected',
      project: projectId,
      fromUser: req.user._id,
      message: `Your push "${mergeRequest.title}" was rejected`,
    });

    req.io?.to(`project-${projectId}`).emit('merge-rejected', { mergeRequestId: mrId });

    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Reject failed' });
  }
};

const getMergeRequests = async (req, res) => {
  const { projectId } = req.params;

  try {
    const mrs = await MergeRequest.find({ project: projectId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(mrs);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

module.exports = {
  pushDraft,
  acceptMerge,
  rejectMerge,
  getMergeRequests,
};