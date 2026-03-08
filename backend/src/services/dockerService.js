// backend/src/services/dockerService.js
const Docker = require('dockerode');
const docker = new Docker(); // defaults to local socket or DOCKER_HOST env

const CONTAINER_PREFIX = 'collabcodex-';
const VOLUME_PREFIX = 'collabcodex-vol-';

const LANGUAGE_IMAGES = {
  javascript: 'node:22-alpine',
  nodejs: 'node:22-alpine',
  python: 'python:3.12-slim',
  java: 'openjdk:21-slim',
  other: 'ubuntu:24.04', // fallback
};

const DEFAULT_LIMITS = {
  Memory: 512 * 1024 * 1024,       // 512MB
  NanoCpus: 500_000_000,           // 0.5 CPU
  CpuPeriod: 100000,
  CpuQuota: 50000,
};

class DockerService {
  /**
   * Get or create persistent container for a project
   */
  async getOrCreateProjectContainer(projectId, language = 'javascript') {
    const containerName = `${CONTAINER_PREFIX}${projectId}`;
    const volumeName = `${VOLUME_PREFIX}${projectId}`;

    try {
      // Check if container already exists
      let container = docker.getContainer(containerName);
      await container.inspect();
      return container;
    } catch (err) {
      if (err.statusCode !== 404) throw err;
    }

    // Create named volume for persistent files
    await docker.createVolume({
      Name: volumeName,
      Driver: 'local',
    });

    const image = LANGUAGE_IMAGES[language] || LANGUAGE_IMAGES.other;

    // Pull image if not present
    try {
      await docker.pull(image);
    } catch (pullErr) {
      console.error(`Failed to pull ${image}:`, pullErr);
      throw new Error(`Cannot pull Docker image: ${image}`);
    }

    // Create & start container
    const container = await docker.createContainer({
      Image: image,
      name: containerName,
      Hostname: containerName,
      Tty: true,
      OpenStdin: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: '/workspace',
      Cmd: ['/bin/sh'], // fallback shell
      Volumes: {
        '/workspace': {}, // bind to volume
      },
      HostConfig: {
        Binds: [`${volumeName}:/workspace`],
        Memory: DEFAULT_LIMITS.Memory,
        NanoCpus: DEFAULT_LIMITS.NanoCpus,
        CpuPeriod: DEFAULT_LIMITS.CpuPeriod,
        CpuQuota: DEFAULT_LIMITS.CpuQuota,
        CapDrop: ['ALL'], // security: drop all capabilities
        SecurityOpt: ['no-new-privileges'],
      },
      Labels: {
        'collabcodex.project': projectId,
      },
    });

    await container.start();

    // Initial setup (e.g. npm init for node)
    if (language === 'javascript' || language === 'nodejs') {
      await this.execInContainer(container, ['npm', 'init', '-y'], true);
    }

    return container;
  }

  /**
   * Execute command in container
   */
  async execInContainer(container, cmd, detach = false) {
    const exec = await container.exec({
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
      Tty: !detach,
      WorkingDir: '/workspace',
    });

    const stream = await exec.start({ hijack: true, stdin: false });
    return new Promise((resolve, reject) => {
      let output = '';
      stream.on('data', (chunk) => (output += chunk.toString()));
      stream.on('end', () => resolve({ output, exitCode: 0 })); // simplified
      stream.on('error', reject);
    });
  }

  /**
   * Cleanup container + volume for project
   */
  async cleanupProject(projectId) {
    const containerName = `${CONTAINER_PREFIX}${projectId}`;
    const volumeName = `${VOLUME_PREFIX}${projectId}`;

    try {
      const container = docker.getContainer(containerName);
      await container.stop({ t: 5 });
      await container.remove({ force: true });
    } catch (err) {
      if (err.statusCode !== 404) console.error('Container cleanup failed:', err);
    }

    try {
      const volume = docker.getVolume(volumeName);
      await volume.remove({ force: true });
    } catch (err) {
      if (err.statusCode !== 404) console.error('Volume cleanup failed:', err);
    }
  }

  /**
   * Restart container (language change, restart button)
   */
  async restartContainer(projectId, newLanguage) {
    await this.cleanupProject(projectId);
    return this.getOrCreateProjectContainer(projectId, newLanguage);
  }

  /**
   * List all CollabCodeX containers (debug)
   */
  async listProjectContainers() {
    const containers = await docker.listContainers({
      filters: { label: [`collabcodex.project`] },
    });
    return containers;
  }
}

module.exports = new DockerService();