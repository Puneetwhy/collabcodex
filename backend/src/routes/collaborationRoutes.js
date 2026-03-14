// backend/src/routes/collaborationRoutes.js
const express = require('express');
const router = express.Router();

const {
  acceptInvite,
  rejectInvite,
  getPendingInvites,
  updateMemberRole,
  removeMember,
  getProjectMembers,
} = require('../controllers/collaborationController');

const { protect } = require('../middlewares/authMiddleware');
const { isOwner, isEditor } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(protect);

// Accept/reject own invitation
router.post('/invites/:membershipId/accept', acceptInvite);
router.post('/invites/:membershipId/reject', rejectInvite);

// Get pending invites for current user
router.get('/invites/pending', getPendingInvites);

// Project-specific member routes
router.get('/:projectId/members', isEditor, getProjectMembers);
router.patch('/:projectId/members/:memberId/role', isOwner, updateMemberRole);
router.delete('/:projectId/members/:memberId', isOwner, removeMember);

module.exports = router;