// backend/src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();

// Controllers
const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteToProject,
  exportProject,           // ← added this (you missed exporting it earlier)
} = require('../controllers/projectController');

// Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { isOwner, isViewerOrHigher } = require('../middlewares/roleMiddleware'); // ← this line fixes the crash

// Apply global auth protection to all routes
router.use(protect);

// Routes
router.post('/', createProject);
router.get('/my', getMyProjects);
router.get('/:id', getProjectById);
router.patch('/:id', isOwner, updateProject);
router.delete('/:id', isOwner, deleteProject);

// Export route: allow viewer/editor/owner (read access)
router.get('/:id/export', isViewerOrHigher, exportProject);

// Invite route: owner only
router.post('/:id/invite', isOwner, inviteToProject);

module.exports = router;