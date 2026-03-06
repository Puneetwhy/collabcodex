// backend/src/routes/executionRoutes.js
const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/executionController');
const { protect } = require('../middlewares/authMiddleware');
const { isEditor } = require('../middlewares/roleMiddleware');

// POST /api/execution/run
// Body: { projectId, mode: 'main' | 'draft' }
router.post('/run', protect, isEditor, runCode);

module.exports = router;