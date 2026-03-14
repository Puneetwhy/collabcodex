// backend/src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();

const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteToProject,
  exportProject,
} = require('../controllers/projectController');

const { protect } = require('../middlewares/authMiddleware');
const { isOwner, isViewerOrHigher } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(protect);

// Create project (any logged-in user)
router.post('/', createProject);

// List own projects
router.get('/my', getMyProjects);

// Get single project (viewer or higher)
router.get('/:id', isViewerOrHigher, getProjectById);

// Update project (owner only)
router.patch('/:id', isOwner, updateProject);

// Delete project (owner only)
router.delete('/:id', isOwner, deleteProject);

// Invite to project (owner only)
router.post('/:id/invite', isOwner, inviteToProject);

// Export project (viewer or higher)
router.get('/:id/export', isViewerOrHigher, exportProject);

module.exports = router;