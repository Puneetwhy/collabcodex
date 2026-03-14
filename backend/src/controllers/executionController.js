// backend/src/controllers/executionController.js
const Docker = require('dockerode');
const docker = new Docker();
const Project = require('../models/Project');
const UserDraft = require('../models/UserDraft');
const DockerService = require('../services/dockerService');

const EXEC_TIMEOUT_MS = 8000;

function detectLanguage(filesMap, projectLanguage) {
  if (projectLanguage && projectLanguage !== 'other') return projectLanguage;

  const keys = Array.from(filesMap.keys());
  if (keys.some(f => f.endsWith('.js') || f.endsWith('.ts'))) return 'nodejs';
  if (keys.some(f => f.endsWith('.py'))) return 'python';
  if (keys.some(f => f.endsWith('.java'))) return 'java';
  return 'nodejs';
}

async function createExecContainer(projectId, filesMap, language) {
  const name = `exec-${projectId}-${Date.now()}`;
  const volume = `temp-vol-${Date.now()}`;

  await docker.createVolume({ Name: volume });

  const image = DockerService.LANGUAGE_IMAGES[language] || 'node:22-alpine';

  const container = await docker.createContainer({
    Image: image,
    name,
    WorkingDir: '/workspace',
    Cmd: ['/bin/sh', '-c', 'sleep infinity'],
    Volumes: { '/workspace': {} },
    HostConfig: {
      Binds: [`${volume}:/workspace`],
      Memory: 512 * 1024 * 1024,
      NanoCpus: 500_000_000,
      AutoRemove: true,
    },
  });

  await container.start();

  // Real file copy using tar-stream (much better than echo)
  const tarStream = require('tar-stream');
  const pack = tarStream.pack();

  for (const [path, content] of filesMap) {
    pack.entry({ name: path }, content);
  }

  pack.finalize();

  await container.putArchive(pack, { path: '/workspace' });

  return { container, volume };
}

function extractPreviewUrl(output) {
  const match = output.match(/(http:\/\/(?:localhost|0\.0\.0\.0|127\.0\.0\.1):(\d+))/);
  return match ? match[1].replace('0.0.0.0', 'localhost').replace('127.0.0.1', 'localhost') : null;
}

const runCode = async (req, res) => {
  const { projectId, mode = 'draft' } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const filesMap = mode === 'draft'
      ? (await UserDraft.findOne({ user: req.user._id, project: projectId }))?.files || new Map()
      : project.mainFiles;

    if (filesMap.size === 0) return res.status(400).json({ message: 'No files' });

    const language = detectLanguage(filesMap, project.language);
    const { container, volume } = await createExecContainer(projectId, filesMap, language);

    const timeoutId = setTimeout(async () => {
      await container.stop({ t: 2 }).catch(() => {});
      await container.remove({ force: true }).catch(() => {});
      res.status(408).json({ message: 'Timeout' });
    }, EXEC_TIMEOUT_MS);

    let output = '';
    let previewUrl = null;

    const runCmd = language === 'nodejs' ? ['npm', 'run', 'dev'] :
                   language === 'python' ? ['python', 'app.py'] :
                   language === 'java' ? ['java', 'Main'] :
                   ['echo', 'No run command'];

    const exec = await container.exec({
      Cmd: runCmd,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
    });

    const stream = await exec.start();

    stream.on('data', chunk => {
      const str = chunk.toString();
      output += str;
      const url = extractPreviewUrl(str);
      if (url && !previewUrl) previewUrl = url;
    });

    stream.on('end', async () => {
      clearTimeout(timeoutId);
      await container.stop({ t: 2 }).catch(() => {});
      await container.remove({ force: true }).catch(() => {});
      await docker.getVolume(volume).remove({ force: true }).catch(() => {});

      res.json({ success: true, output, previewUrl, language });
    });

    stream.on('error', err => {
      clearTimeout(timeoutId);
      res.status(500).json({ message: 'Execution error', error: err.message });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Execution failed', error: err.message });
  }
};

module.exports = { runCode };