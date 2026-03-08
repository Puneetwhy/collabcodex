// frontend/src/components/Editor/MonacoWrapper.jsx
import { useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { cn } from '@/lib/utils'; // ← Yeh line add karo (cn ke liye)

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#9B59B6',
  '#3498DB', '#E74C3C', '#2ECC71', '#F1C40F', '#E67E22',
];

const MonacoWrapper = ({
  value,
  onChange,
  path = 'index.js',
  language = 'javascript',
  readOnly = false,
  socket,
  user,
  onSelect,
  theme = 'light',
}) => {
  const editorRef = useRef(null);
  const decorationsRef = useRef({}); // userId → { ids, color }
  const styleRef = useRef(null);
  const lastEmitRef = useRef(0);

  // Get consistent color for each remote user
  const getUserColor = useCallback((userId) => {
    if (!decorationsRef.current[userId]?.color) {
      const color = COLORS[Object.keys(decorationsRef.current).length % COLORS.length];
      decorationsRef.current[userId] = { color };
    }
    return decorationsRef.current[userId].color;
  }, []);

  // Update remote cursor/selection decorations
  const updateDecoration = useCallback((userId, cursor, selection) => {
    const editor = editorRef.current;
    if (!editor) return;

    const color = getUserColor(userId);
    const decorations = [];

    if (cursor) {
      decorations.push({
        range: new monaco.Range(cursor.line, cursor.column, cursor.line, cursor.column),
        options: {
          className: `remote-cursor-${userId}`,
          after: {
            content: ' ',
            inlineClassName: `remote-cursor-indicator-${userId}`,
          },
        },
      });
    }

    if (selection) {
      decorations.push({
        range: new monaco.Range(
          selection.startLine,
          selection.startColumn,
          selection.endLine,
          selection.endColumn
        ),
        options: { className: `remote-selection-${userId}` },
      });
    }

    const oldIds = decorationsRef.current[userId]?.ids || [];
    const newIds = editor.deltaDecorations(oldIds, decorations);
    decorationsRef.current[userId].ids = newIds;

    // Inject dynamic CSS for cursor/selection
    if (styleRef.current) {
      let css = '';
      Object.entries(decorationsRef.current).forEach(([uid, { color }]) => {
        css += `
          .remote-cursor-indicator-${uid} {
            border-left: 2px solid ${color};
            margin-left: -1px;
          }
          .remote-selection-${uid} {
            background-color: ${color}33 !important;
          }
        `;
      });
      styleRef.current.innerHTML = css;
    }
  }, [getUserColor]);

  // Throttled cursor/selection send
  const sendCursorUpdate = useCallback(() => {
    if (!editorRef.current || !socket || !user) return;

    const now = Date.now();
    if (now - lastEmitRef.current < 50) return; // throttle 50ms
    lastEmitRef.current = now;

    const position = editorRef.current.getPosition();
    const selection = editorRef.current.getSelection();

    socket.emit('cursor-move', {
      projectId: socket.projectId, // assuming projectId in socket context
      cursor: { line: position.lineNumber, column: position.column },
    });

    if (selection) {
      socket.emit('selection-change', {
        projectId: socket.projectId,
        selection: {
          startLine: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLine: selection.endLineNumber,
          endColumn: selection.endColumn,
        },
      });
    }

    // Also send selected text to AI pane if needed
    if (onSelect) {
      const selectedText = editorRef.current.getModel().getValueInRange(selection);
      onSelect({ text: selectedText || '' });
    }
  }, [socket, user, onSelect]);

  // Mount editor + listeners
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !socket || !user) return;

    const posListener = editor.onDidChangeCursorPosition(sendCursorUpdate);
    const selListener = editor.onDidChangeCursorSelection(sendCursorUpdate);

    const handleRemoteUpdate = ({ userId, cursor, selection }) => {
      if (userId === user._id) return;
      updateDecoration(userId, cursor, selection);
    };

    socket.on('cursor-move', handleRemoteUpdate);
    socket.on('selection-change', handleRemoteUpdate);

    return () => {
      posListener.dispose();
      selListener.dispose();
      socket.off('cursor-move', handleRemoteUpdate);
      socket.off('selection-change', handleRemoteUpdate);
    };
  }, [socket, user, sendCursorUpdate, updateDecoration]);

  // Inject global styles for remote cursors/selections
  useEffect(() => {
    const style = document.createElement('style');
    styleRef.current = style;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-full w-full border border-border rounded-md overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        value={value}
        defaultLanguage={language}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        path={path}
        onChange={onChange}
        onMount={(editor, monacoInstance) => {
          editorRef.current = editor;
          // Optional: Add custom monaco configurations here
          monacoInstance.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#0f1117',
            },
          });
          monacoInstance.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#ffffff',
            },
          });
        }}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          links: true,
          renderWhitespace: 'boundary',
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

export default MonacoWrapper;