// frontend/src/pages/ProjectDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useTheme } from '@/hooks/useTheme';
import { useSocket } from '@/hooks/useSocket';
import MonacoWrapper from '@/components/Editor/MonacoWrapper';
import FileTree from '@/components/Editor/FileTree';
import TerminalPane from '@/components/Terminal/TerminalPane';
import AIChatPane from '@/components/AIChat/AIChatPane';
import ProjectChat from '@/components/Chat/ProjectChat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Play, Upload, Users, Code2, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { socket, onlineUsers } = useSocket(projectId);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [draftFiles, setDraftFiles] = useState(new Map());
  const [activeFile, setActiveFile] = useState(null);
  const [currentContent, setCurrentContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [isAIWindowOpen, setAIWindowOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not logged in');

        const res = await axios.get(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProject(res.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project');
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Initialize files once project loads
  useEffect(() => {
    if (!project) return;

    const initialFiles = project.mainFiles instanceof Map
      ? project.mainFiles
      : new Map(Object.entries(project.mainFiles || {}));

    // Add defaults if empty
    if (initialFiles.size === 0) {
      initialFiles.set('index.js', '// Welcome to CollabCodeX\nconsole.log("Hello World! 🚀");');
      initialFiles.set('README.md', '# Welcome to your CollabCodeX project\n\nStart coding!');
    }

    setDraftFiles(initialFiles);

    // Prefer non-README file
    const files = Array.from(initialFiles.keys());
    const preferred = files.find(f => f !== 'README.md' && /\.(js|ts|py|java|jsx)$/.test(f)) || files[0];
    const active = preferred || 'index.js';
    setActiveFile(active);
    setCurrentContent(initialFiles.get(active) || '');
  }, [project]);

  // Update content when active file changes
  useEffect(() => {
    if (!draftFiles.size || !activeFile) return;
    setCurrentContent(draftFiles.get(activeFile) || '');
  }, [activeFile, draftFiles]);

  // Real-time draft sync via socket
  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('join-project', { projectId });

    socket.on('draft-update', ({ files }) => {
      setDraftFiles(new Map(Object.entries(files)));
      // If active file was removed, switch to first
      if (!files[activeFile]) {
        const first = Object.keys(files)[0] || 'index.js';
        setActiveFile(first);
      }
    });

    return () => {
      socket.emit('leave-project', { projectId });
      socket.off('draft-update');
    };
  }, [socket, projectId, activeFile]);

  const handleEditorChange = (value) => {
    setCurrentContent(value);
    setDraftFiles(prev => {
      const updated = new Map(prev);
      updated.set(activeFile, value);
      socket?.emit('draft-update', { projectId, files: Object.fromEntries(updated) });
      return updated;
    });
  };

  const handleRun = async (mode = 'draft') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not logged in');

      const res = await axios.post(
        '/api/execution/run',
        { projectId, mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${mode} executed`);
      if (res.data.previewUrl) setPreviewUrl(res.data.previewUrl);
    } catch (err) {
      toast.error('Run failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePush = () => {
    toast.info('Push to review started');
    socket?.emit('push-draft', { projectId });
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Skeleton className="h-12 w-64 rounded-lg" />
    </div>
  );

  if (error || !project) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-destructive">
      <h1 className="text-2xl font-bold">Project not found</h1>
      <Button onClick={() => navigate('/dashboard')} className="mt-4">Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-border flex items-center px-4 justify-between shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-lg font-semibold truncate max-w-[300px]">{project.name}</h1>
          <Badge variant="outline">{project.language || 'JavaScript'}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{onlineUsers?.length || 0} online</span>

          <Button variant="outline" size="sm" onClick={() => handleRun('main')} className="flex items-center gap-1">
            <Play size={16} /> Run Main
          </Button>
          <Button size="sm" onClick={() => handleRun('draft')}>
            Run Draft
          </Button>
          <Button size="sm" onClick={handlePush} className="flex items-center gap-1">
            <Upload size={16} /> Push
          </Button>
          <Button size="sm" onClick={() => setAIWindowOpen(true)}>
            AI Chat
          </Button>
        </div>
      </header>

      {/* Main Panels */}
      <PanelGroup
        direction={isMobile ? 'vertical' : 'horizontal'}
        className="flex-1 overflow-hidden"
        autoSaveId="project-detail-layout"
      >
        {/* Left: File Tree + Editor */}
        <Panel defaultSize={50} minSize={30} order={1}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={20} minSize={15} order={1}>
              <FileTree
                files={draftFiles}
                onFileSelect={setActiveFile}
                selectedPath={activeFile}
                projectId={projectId}
              />
            </Panel>
            <PanelResizeHandle className="h-1 bg-border hover:bg-primary/30 transition-colors" />
            <Panel defaultSize={80} minSize={40} order={2}>
              <MonacoWrapper
                value={currentContent}
                onChange={handleEditorChange}
                path={activeFile}
                language={project.language || 'javascript'}
                theme={theme}
                onSelect={selection => setSelectedCode(selection?.text || '')}
              />
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className={isMobile ? "h-1 bg-border" : "w-1 bg-border"} />

        {/* Right: Preview + Terminal + Chat */}
        <Panel defaultSize={50} minSize={30} order={2}>
          <PanelGroup direction="vertical">
            {/* Preview */}
            <Panel defaultSize={40} minSize={20} order={1}>
              <div className="h-full flex flex-col bg-card rounded-md overflow-hidden">
                <div className="p-2 border-b border-border font-medium flex items-center gap-2">
                  <Code2 size={16} /> Live Preview
                </div>
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="flex-1 w-full border-none"
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Run the code to see preview
                  </div>
                )}
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-border hover:bg-primary/30 transition-colors" />

            {/* Terminal */}
            <Panel defaultSize={30} minSize={20} order={2}>
              <TerminalPane projectId={projectId} />
            </Panel>

            <PanelResizeHandle className="h-1 bg-border hover:bg-primary/30 transition-colors" />

            {/* Project Chat */}
            <Panel defaultSize={30} minSize={20} order={3}>
              <div className="h-full flex flex-col bg-card/50 rounded-md">
                <ProjectChat projectId={projectId} />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* AI Chat Modal */}
      {isAIWindowOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">AI Assistant</h2>
              <Button size="sm" onClick={() => setAIWindowOpen(false)}>Close</Button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <AIChatPane selectedCode={selectedCode} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;