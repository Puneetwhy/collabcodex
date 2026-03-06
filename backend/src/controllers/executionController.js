// backend/src/controllers/executionController.js
const Docker = require('dockerode');
const docker = new Docker();
const Project = require('../models/Project');
const UserDraft = require('../models/UserDraft');
const DockerService = require('../services/dockerService');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const { isEditor } = require('../middlewares/roleMiddleware');

const EXEC_TIMEOUT_MS = 8000; // 8 seconds
const CONTAINER_PREFIX = 'exec-'; // temp execution containers

// Helper: Detect language from files or project setting
function detectLanguage(filesMap, projectLanguage) {
  if (projectLanguage && projectLanguage !== 'other') return projectLanguage;

  const fileKeys = Array.from(filesMap.keys());
  if (fileKeys.some(f => f.endsWith('.js') || f.endsWith('.ts'))) return 'nodejs';
  if (fileKeys.some(f => f.endsWith('.py'))) return 'python';
  if (fileKeys.some(f => f.endsWith('.java'))) return 'java';
  return 'nodejs'; // default
}

// Helper: Create temp execution container with snapshot files
async function createExecContainer(projectId, filesMap, language) {
  const tempContainerName = `${CONTAINER_PREFIX}${projectId}-${Date.now()}`;

  // Use same image as persistent one
  const image = DockerService['LANGUAGE_IMAGES'][language] || 'node:22-alpine';

  // Create temp volume for this run (no persistence needed)
  const tempVolumeName = `temp-exec-vol-${Date.now()}`;

  await docker.createVolume({ Name: tempVolumeName });

  const container = await docker.createContainer({
    Image: image,
    name: tempContainerName,
    Tty: false,
    OpenStdin: false,
    WorkingDir: '/workspace',
    Cmd: ['/bin/sh', '-c', 'sleep infinity'], // keep alive for execs
    Volumes: { '/workspace': {} },
    HostConfig: {
      Binds: [`${tempVolumeName}:/workspace`],
      Memory: 512 * 1024 * 1024,
      NanoCpus: 500_000_000,
      AutoRemove: true, // auto-remove on stop
    },
  });

  await container.start();

  // Copy files into volume (docker cp style via putArchive - simplified here)
  // In production, use tar-stream + putArchive for real file copy
  // For MVP: exec commands to echo > file (slow but works for small projects)
  for (const [path, content] of filesMap) {
    const dir = path.substring(0, path.lastIndexOf('/'));
    if (dir) {
      await container.exec({ Cmd: ['mkdir', '-p', `/workspace/${dir}`] }).start();
    }
    await container.exec({
      Cmd: ['sh', '-c', `echo ${JSON.stringify(content)} > /workspace/${path}`],
    }).start();
  }

  return { container, tempVolumeName };
}

// Helper: Parse output for dev server URL (e.g. Vite, Flask, etc.)
function extractPreviewUrl(output) {
  const urlRegex = /(http:\/\/localhost:\d+|http:\/\/0\.0\.0\.0:\d+|http:\/\/127\.0\.0\.1:\d+)/g;
  const matches = output.match(urlRegex);
  return matches ? matches[0] : null;
}

const runCode = async (req, res) => {
  const { projectId, mode = 'main' } = req.body; // mode: 'main' | 'draft'

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let filesMap;
    let language = project.language;

    if (mode === 'draft') {
      const draft = await UserDraft.findOne({ user: req.user._id, project: projectId });
      if (!draft) return res.status(404).json({ message: 'No draft found' });
      filesMap = draft.files;
      language = detectLanguage(filesMap, language);
    } else {
      filesMap = project.mainFiles;
      language = detectLanguage(filesMap, language);
    }

    if (filesMap.size === 0) {
      return res.status(400).json({ message: 'No files to execute' });
    }

    const { container, tempVolumeName } = await createExecContainer(projectId, filesMap, language);

    // Timeout killer
    const timeoutId = setTimeout(async () => {
      try {
        await container.stop({ t: 2 });
        await container.remove({ force: true });
      } catch {}
      res.status(408).json({ message: 'Execution timeout (8s)' });
    }, EXEC_TIMEOUT_MS);

    // Determine run command based on language & common patterns
    let runCmd;
    if (language === 'nodejs') {
      runCmd = ['npm', 'run', 'dev']; // assume package.json has it
      // Fallback: node index.js or similar
    } else if (language === 'python') {
      runCmd = ['python', 'app.py']; // common Flask/FastAPI entry
    } else if (language === 'java') {
      runCmd = ['java', 'Main']; // assume compiled or use javac first
    } else {
      runCmd = ['echo', 'No run command defined for this language'];
    }

    // Execute run command
    const exec = await container.exec({
      Cmd: runCmd,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      WorkingDir: '/workspace',
    });

    const stream = await exec.start();
    let output = '';
    let previewUrl = null;

    stream.on('data', (chunk) => {
      const str = chunk.toString();
      output += str;

      // Real-time parse for preview URL
      const detected = extractPreviewUrl(str);
      if (detected && !previewUrl) {
        previewUrl = detected.replace('0.0.0.0', 'localhost').replace('127.0.0.1', 'localhost');
      }
    });

    stream.on('end', async () => {
      clearTimeout(timeoutId);
      try {
        await container.stop({ t: 2 });
        await container.remove({ force: true });
        await docker.getVolume(tempVolumeName).remove({ force: true });
      } catch {}

      res.json({
        success: true,
        output,
        previewUrl,
        language,
      });
    });

    stream.on('error', (err) => {
      clearTimeout(timeoutId);
      res.status(500).json({ message: 'Execution error', error: err.message });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during execution', error: err.message });
  }
};

module.exports = { runCode };