import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, Terminal as TerminalIcon, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TerminalPane = ({ projectId }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [language, setLanguage] = useState('javascript');
  const [status, setStatus] = useState('Disconnected');
  const { socket } = useSocket(projectId);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0f1117',
        foreground: '#e6edf3',
        cursor: '#ffffff',
        selectionBackground: '#2d333b',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.3,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    term.focus();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const resizeListener = () => fitAddon.fit();
    window.addEventListener('resize', resizeListener);

    // Join project & attach terminal
    socket.emit('join-project', { projectId });
    socket.emit('attach-terminal', { projectId, language });

    // Status updates
    socket.on('terminal-status', (msg) => {
      setStatus(msg);
      term.write(`\r\n${msg}\r\n$ `);
    });

    // Real output from Docker
    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Send user input to backend
    term.onData((data) => {
      socket.emit('terminal-input', { projectId, data });
    });

    // Ctrl+C support
    term.onKey(({ key, domEvent }) => {
      if (domEvent.ctrlKey && key === 'c') {
        socket.emit('terminal-input', { projectId, data: '\x03' });
        domEvent.preventDefault();
      }
    });

    // Handle resize from frontend
    const handleResize = ({ cols, rows }) => {
      socket.emit('terminal-resize', { projectId, cols, rows });
    };
    term.onResize(handleResize);

    // Cleanup
    return () => {
      socket.emit('detach-terminal', { projectId });
      socket.off('terminal-status');
      socket.off('terminal-output');
      term.dispose();
      window.removeEventListener('resize', resizeListener);
    };
  }, [socket, projectId, language]);

  const handleClear = () => {
    xtermRef.current?.clear();
    xtermRef.current?.write('$ ');
    fitAddonRef.current?.fit();
  };

  const handleRestart = () => {
    socket?.emit('restart-terminal', { projectId, language });
    xtermRef.current?.clear();
    xtermRef.current?.write('\r\nRestarting terminal...\r\n$ ');
    toast.info('Terminal restarted');
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket?.emit('change-terminal-language', { projectId, language: newLang });
    toast.info(`Switched to ${newLang}`);
  };

  return (
    <div className="h-full flex flex-col border border-border/60 overflow-hidden shadow-sm bg-background">
      {/* Header */}
      <div className="h-11 border-t flex items-center px-3 justify-between bg-card border-border">
        <div className="flex items-center gap-2 text-foreground">
          <TerminalIcon size={16} className="text-primary" />
          <span className="font-medium text-sm tracking-tight">Terminal</span>
          <div className="flex items-center gap-1 text-xs">
            <Circle size={6} className={cn('fill-current', status.includes('Connected') ? 'text-green-500' : 'text-red-500')} />
            <span className={cn(status.includes('Connected') ? 'text-green-500' : 'text-red-500')}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-background border border-border text-foreground rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="javascript">Node.js</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <Button variant="ghost" size="icon" onClick={handleClear} title="Clear" className="h-8 w-8 p-0 hover:bg-accent/50">
            <Trash2 size={14} />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleRestart} title="Restart" className="h-8 w-8 p-0 hover:bg-accent/50">
            <RotateCcw size={14} />
          </Button>
        </div>
      </div>

      {/* Terminal Body */}
      <div ref={terminalRef} className="flex-1 bg-black" />
    </div>
  );
};

export default TerminalPane;