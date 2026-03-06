// backend/src/controllers/userDraftController.js
const UserDraft = require('../models/UserDraft');
const Project = require('../models/Project');

// Get or create user's draft for a project (called on project open)
const getOrCreateDraft = async (req, res) => {
  const { projectId } = req.params;

  try {
    let draft = await UserDraft.findOne({
      user: req.user._id,
      project: projectId,
    });

    if (!draft) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      draft = await UserDraft.create({
        user: req.user._id,
        project: projectId,
        files: new Map(project.mainFiles), // start from current Main
        baseVersion: null, // or latest version ID if needed
      });
    }

    res.json({
      files: Object.fromEntries(draft.files), // convert Map to plain object for JSON
      lastSyncedAt: draft.lastSyncedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading draft' });
  }
};

// Save draft (full replace – for initial sync or bulk save after reconnect)
const saveDraft = async (req, res) => {
  const { projectId } = req.params;
  const { files } = req.body; // expect { "path1": "content1", "path2": "content2" }

  if (!files || typeof files !== 'object') {
    return res.status(400).json({ message: 'Files object required' });
  }

  try {
    const draft = await UserDraft.findOneAndUpdate(
      { user: req.user._id, project: projectId },
      {
        files: new Map(Object.entries(files)),
        lastSyncedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      lastSyncedAt: draft.lastSyncedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error saving draft' });
  }
};

// Get draft files snapshot (for diff or recovery)
const getDraftFiles = async (req, res) => {
  const { projectId } = req.params;

  try {
    const draft = await UserDraft.findOne({
      user: req.user._id,
      project: projectId,
    });

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.json({
      files: Object.fromEntries(draft.files),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching draft files' });
  }
};

// Optional: Update single file in draft (for optimistic UI + socket fallback)
const updateDraftFile = async (req, res) => {
  const { projectId } = req.params;
  const { path, content } = req.body;

  if (!path || content === undefined) {
    return res.status(400).json({ message: 'Path and content required' });
  }

  try {
    const draft = await UserDraft.findOne({ user: req.user._id, project: projectId });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    draft.files.set(path, content);
    draft.lastSyncedAt = new Date();
    await draft.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error updating file in draft' });
  }
};

module.exports = {
  getOrCreateDraft,
  saveDraft,
  getDraftFiles,
  updateDraftFile,
};