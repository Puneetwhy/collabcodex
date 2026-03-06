// backend/src/routes/mergeRequestRoutes.js
const express = require('express');
const router = express.Router();
const {
  pushDraft,
  acceptMerge,
  rejectMerge,
  getMergeRequests,
} = require('../controllers/mergeRequestController');
const { protect } = require('../middlewares/authMiddleware');
const { isEditor, isOwner } = require('../middlewares/roleMiddleware');

// All routes protected
router.use(protect);

// Push draft → create MR
router.post('/:projectId/push', isEditor, pushDraft);

// List MRs
router.get('/:projectId', isEditor, getMergeRequests);

// Accept / Reject (owner only)
router.post('/:projectId/merge-requests/:mrId/accept', isOwner, acceptMerge);
router.post('/:projectId/merge-requests/:mrId/reject', isOwner, rejectMerge);

module.exports = router;