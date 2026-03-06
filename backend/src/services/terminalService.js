// backend/src/services/terminalService.js
const Docker = require('dockerode');
const docker = new Docker();
const DockerService = require('./dockerService');

class TerminalService {
  /**
   * Attach interactive terminal session (WebSocket-like via socket.io)
   * Returns a duplex stream for PTY
   * @param {string} projectId 
   * @param {string} language 
   * @returns {Promise<{ stream: any, resize: (cols, rows) => Promise<void> }>}
   */
  async attachTerminal(projectId, language = 'javascript') {
    const container = await DockerService.getOrCreateProjectContainer(projectId, language);

    // Create exec with PTY
    const exec = await container.exec({
      Cmd: ['/bin/sh'], // or bash if available
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      WorkingDir: '/workspace',
    });

    const stream = await exec.start({
      hijack: true,
      stdin: true,
      Detach: false,
    });

    // Resize function (called from frontend on pane resize)
    const resize = async (cols, rows) => {
      try {
        await exec.resize({ h: rows, w: cols });
      } catch (err) {
        console.error('Resize failed:', err);
      }
    };

    // Auto-cleanup on stream end/error
    stream.on('end', () => {
      console.log(`Terminal session ended for project ${projectId}`);
    });

    return { stream, resize };
  }

  /**
   * Send command non-interactively (for auto-suggest or run buttons)
   */
  async sendCommand(projectId, command) {
    const container = await DockerService.getOrCreateProjectContainer(projectId);
    return DockerService.execInContainer(container, command.split(' '));
  }

  /**
   * Restart terminal container (clear / restart button)
   */
  async restartTerminal(projectId, language) {
    return DockerService.restartContainer(projectId, language);
  }
}

module.exports = new TerminalService();