// backend/src/controllers/terminalController.js
const TerminalService = require('../services/terminalService');

/**
 * Attach a new terminal session
 * Called when frontend requests a new terminal
 */
const attachTerminal = async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user._id;

  try {
    const { sessionId } = await TerminalService.attachTerminal(projectId, userId);

    res.json({
      success: true,
      sessionId,
      message: 'Terminal session attached',
    });
  } catch (err) {
    console.error('Attach terminal error:', err);
    res.status(500).json({ message: 'Failed to attach terminal', error: err.message });
  }
};

/**
 * Send input to an existing terminal session
 */
const sendInput = async (req, res) => {
  const { sessionId } = req.params;
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ message: 'Input is required' });
  }

  try {
    await TerminalService.sendInput(sessionId, input);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Invalid session or input failed', error: err.message });
  }
};

/**
 * Resize terminal session (called on pane resize)
 */
const resizeTerminal = async (req, res) => {
  const { sessionId } = req.params;
  const { cols, rows } = req.body;

  if (!cols || !rows || cols < 10 || rows < 5) {
    return res.status(400).json({ message: 'Valid cols and rows required' });
  }

  try {
    await TerminalService.resize(sessionId, cols, rows);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Resize failed', error: err.message });
  }
};

/**
 * Restart terminal for a project
 */
const restartTerminal = async (req, res) => {
  const { projectId } = req.body;

  try {
    await TerminalService.restartTerminal(projectId);
    res.json({ success: true, message: 'Terminal restarted' });
  } catch (err) {
    res.status(500).json({ message: 'Restart failed', error: err.message });
  }
};

/**
 * Change terminal language/environment
 */
const changeLanguage = async (req, res) => {
  const { projectId } = req.params;
  const { language } = req.body;

  if (!['javascript', 'nodejs', 'python', 'java'].includes(language)) {
    return res.status(400).json({ message: 'Invalid language' });
  }

  try {
    await TerminalService.restartTerminal(projectId, language);
    res.json({ success: true, message: `Switched to ${language}` });
  } catch (err) {
    res.status(500).json({ message: 'Language switch failed', error: err.message });
  }
};

/**
 * Clear terminal output (client-side clear + reset prompt)
 */
const clearTerminal = async (req, res) => {
  const { sessionId } = req.params;

  try {
    // We can't clear server-side PTY, but we can reset session state if needed
    // For now, just acknowledge client-side clear
    res.json({ success: true, message: 'Terminal cleared (client-side)' });
  } catch (err) {
    res.status(500).json({ message: 'Clear failed', error: err.message });
  }
};

module.exports = {
  attachTerminal,
  sendInput,
  resizeTerminal,
  restartTerminal,
  changeLanguage,
  clearTerminal,
};