// frontend/src/pages/ProjectDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useTheme } from '@/hooks/useTheme';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetProjectQuery,
  useRunCodeMutation,
} from '@/features/project/projectApi';
import MonacoWrapper from '@/components/Editor/MonacoWrapper';
import FileTree from '@/components/Editor/FileTree';
import TerminalPane from '@/components/Terminal/TerminalPane';
import AIChatPane from '@/components/AIChat/AIChatPane';
import ProjectChat from '@/components/Chat/ProjectChat';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Upload,
  Users,
  Code2,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket(projectId);
  const { data: project, isLoading, error } =
    useGetProjectQuery(projectId);
  const [runCode, { isLoading: isRunning }] =
    useRunCodeMutation();

  const [draftFiles, setDraftFiles] = useState(new Map());
  const [activeFile, setActiveFile] = useState('index.js');
  const [currentContent, setCurrentContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');

  /* ------------------ FIXED SYNC LOGIC ------------------ */

  useEffect(() => {
    if (!project) return;

    const initialFiles =
      project.mainFiles instanceof Map
        ? project.mainFiles
        : new Map(
            Object.entries(
              project.mainFiles || {
                'index.js': '// Welcome to CollabCodeX',
              }
            )
          );

    setDraftFiles(initialFiles);

    const firstFile =
      initialFiles.has(activeFile)
        ? activeFile
        : initialFiles.keys().next().value;

    setActiveFile(firstFile);
    setCurrentContent(initialFiles.get(firstFile) || '');
  }, [project]);

  useEffect(() => {
    if (!draftFiles.size) return;
    setCurrentContent(draftFiles.get(activeFile) || '');
  }, [activeFile, draftFiles]);

  /* ------------------------------------------------------ */

  const handleEditorChange = (value) => {
    setCurrentContent(value);

    setDraftFiles((prev) => {
      const updated = new Map(prev);
      updated.set(activeFile, value);

      socket?.emit('draft-update', {
        projectId,
        files: Object.fromEntries(updated),
      });

      return updated;
    });
  };

  const handleRun = async (mode = 'draft') => {
    try {
      const res = await runCode({ projectId, mode }).unwrap();
      toast.success(`Executed ${mode} successfully`);

      if (res?.previewUrl) {
        setPreviewUrl(res.previewUrl);
      }
    } catch (err) {
      toast.error(
        'Execution failed: ' + (err?.data?.message || '')
      );
    }
  };

  const handlePush = () => {
    toast.info(
      'Push to review workflow started (implement merge request)'
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-64 rounded-lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-destructive">
        <h1 className="text-2xl font-bold">
          Project not found
        </h1>
        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-14 border-b border-border flex items-center px-4 justify-between shrink-0 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-lg font-semibold truncate max-w-[300px]">
            {project.name}
          </h1>
          <Badge variant="outline">
            {project.language || 'JavaScript'}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {onlineUsers?.length || 0} online
            </span>

            <div className="flex -space-x-2">
              {onlineUsers?.slice(0, 5).map((u) => (
                <Avatar
                  key={u.userId}
                  className="h-7 w-7 border-2 border-background shadow-sm"
                >
                  <AvatarImage src={u.avatar} alt={u.username} />
                  <AvatarFallback>{u.username?.[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRun('main')}
              className="flex items-center gap-1"
            >
              <Play size={16} />
              Run Main
            </Button>

            <Button
              size="sm"
              onClick={() => handleRun('draft')}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Draft'}
            </Button>

            <Button
              size="sm"
              onClick={handlePush}
              className="flex items-center gap-1"
            >
              <Upload size={16} />
              Push
            </Button>
          </div>
        </div>
      </header>

      {/* Panels */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        
        {/* Left: FileTree + Editor */}
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical">
            
            {/* File Tree */}
            <Panel defaultSize={20} minSize={15}>
              <FileTree
                files={draftFiles}
                onFileSelect={setActiveFile}
                selectedPath={activeFile}
              />
            </Panel>

            <PanelResizeHandle className="bg-border w-1 hover:bg-primary/60 transition-colors" />

            {/* Monaco Editor */}
            <Panel defaultSize={80}>
              <MonacoWrapper
                value={currentContent}
                onChange={handleEditorChange}
                path={activeFile}
                language={project.language || 'javascript'}
                theme={theme}
                onSelect={(selection) =>
                  setSelectedCode(selection?.text || '')
                }
              />
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="bg-border w-1 hover:bg-primary/60 transition-colors" />

        {/* Right: Preview, Terminal, Chat */}
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical">
            
            {/* Live Preview */}
            <Panel defaultSize={40} minSize={20}>
              <div className="h-full flex flex-col bg-muted/10 rounded-md overflow-hidden">
                <div className="p-2 border-b border-border font-medium flex items-center gap-2 bg-muted/5">
                  <Code2 size={16} />
                  Live Preview
                </div>
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="flex-1 w-full border-none rounded-b-md"
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Run the code to see preview
                  </div>
                )}
              </div>
            </Panel>

            <PanelResizeHandle className="bg-border h-1 hover:bg-primary/60 transition-colors" />

            {/* Terminal */}
            <Panel defaultSize={30} minSize={20}>
              <div className="h-full flex flex-col bg-muted/10 rounded-md overflow-hidden">
                <div className="p-2 border-b border-border font-medium flex items-center gap-2 bg-muted/5">
                  <TerminalIcon size={16} />
                  Integrated Terminal
                </div>
                <TerminalPane projectId={projectId} />
              </div>
            </Panel>

            <PanelResizeHandle className="bg-border h-1 hover:bg-primary/60 transition-colors" />

            {/* AI Chat + Project Chat */}
            <Panel defaultSize={30} minSize={20}>
              <PanelGroup direction="horizontal">
                
                <Panel defaultSize={50}>
                  <div className="h-full flex flex-col bg-muted/5 rounded-md p-2">
                    <AIChatPane selectedCode={selectedCode} />
                  </div>
                </Panel>

                <PanelResizeHandle className="bg-border w-1 hover:bg-primary/60 transition-colors" />

                <Panel defaultSize={50}>
                  <div className="h-full flex flex-col bg-muted/5 rounded-md p-2">
                    <ProjectChat projectId={projectId} />
                  </div>
                </Panel>

              </PanelGroup>
            </Panel>

          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ProjectDetail;