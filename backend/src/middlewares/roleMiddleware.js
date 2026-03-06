// backend/src/middlewares/roleMiddleware.js
const ProjectMember = require('../models/ProjectMember');
const { ROLES } = require('../constants/roles');

// Middleware factory: require at least a minimum role
const requireRole = (minRole) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Get project ID from params/body/query (flexible)
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

    const userRole = membership.role;

    // Simple role hierarchy check (owner > editor > viewer)
    const roleLevels = {
      [ROLES.OWNER]: 3,
      [ROLES.EDITOR]: 2,
      [ROLES.VIEWER]: 1,
    };

    if (roleLevels[userRole] < roleLevels[minRole]) {
      return res.status(403).json({
        message: `Insufficient permissions. Required at least: ${minRole}, you have: ${userRole}`,
      });
    }

    // Attach membership to req for use in controllers
    req.membership = membership;
    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    res.status(500).json({ message: 'Server error during role check' });
  }
};

// Convenience middleware
const isOwner = requireRole(ROLES.OWNER);
const isEditor = requireRole(ROLES.EDITOR);
const isViewerOrHigher = requireRole(ROLES.VIEWER); // Allows viewer, editor, owner

// Optional: Granular permission check (if you add PERMISSIONS later)
const hasPermission = (permission) => async (req, res, next) => {
  // For now: just use role-based — extend later if needed
  next();
};

module.exports = {
  requireRole,
  hasPermission,
  isOwner,
  isEditor,
  isViewerOrHigher,
};