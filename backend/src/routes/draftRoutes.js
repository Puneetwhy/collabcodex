// backend/src/routes/draftRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOrCreateDraft,
  saveDraft,
  getDraftFiles,
  updateDraftFile,
} = require('../controllers/userDraftController');
const { protect } = require('../middlewares/authMiddleware');
const { isEditor } = require('../middlewares/roleMiddleware');

// All draft routes require editor permissions
router.use(protect);
router.use(isEditor);

router.get('/:projectId', getOrCreateDraft);
router.post('/:projectId', saveDraft);
router.get('/:projectId/files', getDraftFiles);
router.patch('/:projectId/file', updateDraftFile);

module.exports = router;