// backend/src/routes/terminalRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isEditor } = require('../middlewares/roleMiddleware');

const {
  attachTerminal,
  sendInput,
  resizeTerminal,
  restartTerminal,
  changeLanguage,
  clearTerminal,
} = require('../controllers/terminalController');

// All terminal routes require auth + editor permissions
router.use(protect);
router.use(isEditor);

// Attach new terminal session
router.post('/attach', attachTerminal);

// Input to session
router.post('/:sessionId/input', sendInput);

// Resize session
router.post('/:sessionId/resize', resizeTerminal);

// Restart terminal
router.post('/restart', restartTerminal);

// Change language/environment
router.post('/:projectId/language', changeLanguage);

// Clear terminal
router.post('/:sessionId/clear', clearTerminal);

module.exports = router;