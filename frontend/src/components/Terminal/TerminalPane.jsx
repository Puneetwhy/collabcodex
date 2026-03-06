// frontend/src/components/Terminal/TerminalPane.jsx
import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useSocket } from '@/hooks/useSocket';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, Terminal as TerminalIcon, Circle } from 'lucide-react';
import { toast } from 'sonner';

const TerminalPane = ({ projectId }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const { theme } = useTheme();
  const [language, setLanguage] = useState('javascript');

  const commonCommands = [
    'npm install', 'npm run dev', 'npm start',
    'python app.py', 'flask run', 'javac Main.java',
    'java Main', 'ls', 'pwd', 'clear', 'node index.js',
  ];

  useEffect(() => {
    if (!terminalRef.current || !socket || !isConnected) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: theme === 'dark'
        ? { background: '#0f1117', foreground: '#e6edf3', cursor: '#ffffff', selectionBackground: '#2d333b' }
        : { background: '#ffffff', foreground: '#111827', cursor: '#111827', selectionBackground: '#cce3ff' },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.3,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const resizeListener = () => fitAddon.fit();
    window.addEventListener('resize', resizeListener);

    socket.emit('attach-terminal', { projectId, language });

    const handleOutput = (data) => term.write(data);
    socket.on('terminal-output', handleOutput);

    term.onData((data) => socket.emit('terminal-input', { projectId, data }));

    term.onKey(({ key, domEvent }) => {
      if (domEvent.ctrlKey && key === 'c') {
        socket.emit('terminal-input', { projectId, data: '\x03' });
      }
    });

    socket.on('terminal-resize-required', ({ cols, rows }) => {
      term.resize(cols, rows);
      fitAddon.fit();
    });

    return () => {
      socket.off('terminal-output', handleOutput);
      socket.emit('detach-terminal', { projectId });
      term.dispose();
      window.removeEventListener('resize', resizeListener);
    };
  }, [socket, isConnected, projectId, theme, language]);

  useEffect(() => {
    if (!xtermRef.current) return;

    const term = xtermRef.current;
    let buffer = '';

    const onData = (data) => {
      buffer += data;
      if (data === '\t') {
        const partial = buffer.trim().split(' ').pop();
        const matches = commonCommands.filter(cmd => cmd.startsWith(partial));
        if (matches.length > 0) {
          term.writeln('\r\nSuggestions:');
          matches.forEach(m => term.writeln('  ' + m));
        }
        buffer = '';
      }
    };

    term.onData(onData);
    return () => term.offData(onData);
  }, []);

  const handleClear = () => xtermRef.current?.clear();

  const handleRestart = () => {
    if (!socket) return;
    socket.emit('restart-terminal', { projectId, language });
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\r\nRestarting terminal...');
    }
    toast.info('Terminal restarted');
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket?.emit('change-terminal-language', { projectId, language: newLang });
    toast.info(`Switched to ${newLang} environment`);
  };

  return (
    <div className="h-full flex flex-col rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-background">

      {/* HEADER */}
      <div className="h-11 border-b flex items-center px-5 justify-between bg-muted/30 backdrop-blur">
        <div className="flex items-center gap-3">
          <TerminalIcon size={16} className="text-primary" />
          <span className="font-medium text-sm tracking-tight">Terminal</span>

          <div className="flex items-center gap-1 ml-2 text-xs text-muted-foreground">
            <Circle
              size={8}
              className={isConnected ? 'text-emerald-500 fill-emerald-500' : 'text-red-500 fill-red-500'}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-background border border-border rounded-md px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="javascript">Node.js</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <Button variant="ghost" size="icon" onClick={handleClear} title="Clear" className="hover:bg-accent/50">
            <Trash2 size={15} />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleRestart} title="Restart" className="hover:bg-accent/50">
            <RotateCcw size={15} />
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div ref={terminalRef} className="flex-1 overflow-hidden" />
    </div>
  );
};

export default TerminalPane;