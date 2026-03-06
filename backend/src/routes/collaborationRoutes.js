// backend/src/routes/collaborationRoutes.js
const express = require('express');
const router = express.Router();
const {
  acceptInvite,
  rejectInvite,
  getPendingInvites, // ✅ added
  updateMemberRole,
  removeMember,
  getProjectMembers,
} = require('../controllers/collaborationController');
const { protect } = require('../middlewares/authMiddleware');
const { isOwner, isEditor } = require('../middlewares/roleMiddleware');

// Protected routes
router.use(protect);

// Accept/reject own invite
router.post('/invites/:membershipId/accept', acceptInvite);
router.post('/invites/:membershipId/reject', rejectInvite);

// Get pending invites for logged-in user
router.get('/invites/pending', getPendingInvites); // ✅ this fixes the 404

// Members management (project-specific)
router.get('/:projectId/members', isEditor, getProjectMembers);
router.patch('/:projectId/members/:memberId/role', isOwner, updateMemberRole);
router.delete('/:projectId/members/:memberId', isOwner, removeMember); // owner kicks

module.exports = router;