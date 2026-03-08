// backend/src/services/terminalService.js
const Docker = require('dockerode');
const DockerService = require('./dockerService');
const { v4: uuidv4 } = require('uuid');

const docker = new Docker(); 
class TerminalService {
  constructor() {
    
    this.sessions = new Map();
  }

  async attachTerminal(projectId, language = 'javascript') {
   
    const container = await DockerService.getOrCreateProjectContainer(projectId, language);

    const sessionId = uuidv4();

    const exec = await container.exec({
      Cmd: ['/bin/sh'], 
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      WorkingDir: '/workspace',
      Env: ['TERM=xterm-256color'], 
    });

    
    const stream = await exec.start({
      hijack: true,
      stdin: true,
      Detach: false,
    });

    // Store session
    this.sessions.set(sessionId, {
      container,
      exec,
      stream,
      projectId,
      userId: null, 
    });

    // Resize helper function (called from frontend on pane resize)
    const resize = async (cols, rows) => {
      try {
        await exec.resize({ h: rows || 24, w: cols || 80 });
      } catch (err) {
        console.error(`Resize failed for session ${sessionId}:`, err.message);
      }
    };

    // Auto-cleanup when stream ends
    stream.on('end', () => {
      console.log(`Terminal session ${sessionId} ended for project ${projectId}`);
      this.sessions.delete(sessionId);
    });

    stream.on('error', (err) => {
      console.error(`Stream error in session ${sessionId}:`, err.message);
      this.sessions.delete(sessionId);
    });

    return { sessionId, stream, resize };
  }

  /**
   * Send input to an active terminal session
   * @param {string} sessionId 
   * @param {string} input 
   */
  async sendInput(sessionId, input) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Terminal session not found');

    if (session.stream.writable) {
      session.stream.write(input);
    } else {
      console.warn(`Session ${sessionId} stream not writable`);
    }
  }

  /**
   * Resize an active terminal session
   * @param {string} sessionId 
   * @param {number} cols 
   * @param {number} rows 
   */
  async resize(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Terminal session not found');

    try {
      await session.exec.resize({ h: rows, w: cols });
    } catch (err) {
      console.error(`Resize failed for session ${sessionId}:`, err.message);
    }
  }

  /**
   * Restart / reset terminal session for a project
   * @param {string} projectId 
   * @param {string} language 
   */
  async restartTerminal(projectId, language) {
    // Find and close all sessions for this project
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.projectId === projectId) {
        if (session.stream && session.stream.writable) {
          session.stream.end();
        }
        this.sessions.delete(sessionId);
      }
    }

    // Restart container itself
    await DockerService.restartContainer(projectId, language);

    // New session will be created on next attach
  }

  /**
   * Clean up all sessions for a project (on project delete or disconnect)
   * @param {string} projectId 
   */
  async cleanupProject(projectId) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.projectId === projectId) {
        if (session.stream && session.stream.writable) {
          session.stream.end();
        }
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get active session count (debug/monitoring)
   */
  getActiveSessionsCount() {
    return this.sessions.size;
  }
}

module.exports = new TerminalService();