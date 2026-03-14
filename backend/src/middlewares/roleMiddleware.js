// backend/src/middlewares/roleMiddleware.js
const ProjectMember = require('../models/ProjectMember');
const { ROLES } = require('../constants/roles');

const requireRole = (minRole) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID required for role check' });
  }

  try {
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
      status: 'active',
    });

    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const roleLevels = {
      [ROLES.OWNER]: 3,
      [ROLES.EDITOR]: 2,
      [ROLES.VIEWER]: 1,
    };

    if (roleLevels[membership.role] < roleLevels[minRole]) {
      return res.status(403).json({
        message: `Insufficient permissions. Required: ${minRole}, you have: ${membership.role}`,
      });
    }

    req.membership = membership;
    next();
  } catch (err) {
    console.error('Role middleware error:', err.message);
    res.status(500).json({ message: 'Server error during role check' });
  }
};

const isOwner = requireRole(ROLES.OWNER);
const isEditor = requireRole(ROLES.EDITOR);
const isViewerOrHigher = requireRole(ROLES.VIEWER);

module.exports = {
  requireRole,
  isOwner,
  isEditor,
  isViewerOrHigher,
};