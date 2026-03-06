// backend/src/controllers/terminalController.js
// Placeholder – real implementation uses dockerode + socket.io

const attachTerminal = (req, res) => {
  res.json({ message: 'Terminal session attached (placeholder)' });
};

const sendInput = (req, res) => {
  res.json({ message: 'Input sent to container (placeholder)' });
};

const resizeTerminal = (req, res) => {
  res.json({ message: 'Terminal resized (placeholder)' });
};

const restartTerminal = (req, res) => {
  res.json({ message: 'Terminal restarted (placeholder)' });
};

const changeLanguage = (req, res) => {
  res.json({ message: 'Switched language/container (placeholder)' });
};

const clearTerminal = (req, res) => {
  res.json({ message: 'Terminal cleared (placeholder)' });
};

module.exports = {
  attachTerminal,
  sendInput,
  resizeTerminal,
  restartTerminal,
  changeLanguage,
  clearTerminal,
};