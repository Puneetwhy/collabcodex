// backend/src/routes/terminalRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isEditor } = require('../middlewares/roleMiddleware');

// Placeholder controller functions (expand later with dockerode/socket)
const {
  attachTerminal,
  sendInput,
  resizeTerminal,
  restartTerminal,
  changeLanguage,
  clearTerminal,
} = require('../controllers/terminalController');

// All terminal routes require auth + editor access
router.use(protect);
router.use(isEditor);

// Start/attach terminal session
router.post('/attach', attachTerminal);

// Send user input to container
router.post('/input', sendInput);

// Resize terminal (called from xterm fit addon)
router.post('/resize', resizeTerminal);

// Restart terminal (kill & recreate container)
router.post('/restart', restartTerminal);

// Switch language (Node/Python/Java → different image)
router.post('/language', changeLanguage);

// Clear terminal output
router.post('/clear', clearTerminal);

module.exports = router;