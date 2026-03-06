// frontend/src/components/Editor/MonacoWrapper.jsx
import { useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

// Predefined palette for users
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#9B59B6',
  '#3498DB', '#E74C3C', '#2ECC71',
];

const MonacoWrapper = ({
  value,
  onChange,
  path = 'index.js',
  language = 'javascript',
  readOnly = false,
}) => {
  const editorRef = useRef(null);
  const decorationIdsRef = useRef({});
  const socketRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styleRef = useRef(null);

  // Assign a persistent color per user
  const getUserColor = useCallback((userId) => {
    if (!decorationIdsRef.current[userId]?.color) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      decorationIdsRef.current[userId] = {
        ...decorationIdsRef.current[userId],
        color,
      };
    }
    return decorationIdsRef.current[userId].color;
  }, []);

  // Update remote cursor & selection decorations
  const updateDecoration = useCallback((userId, cursor, selection) => {
    const editor = editorRef.current;
    if (!editor) return;

    const decorations = [];
    const color = getUserColor(userId);

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
        range: new monaco.Range(selection.startLine, selection.startColumn, selection.endLine, selection.endColumn),
        options: {
          className: `remote-selection-${userId}`,
        },
      });
    }

    const oldIds = decorationIdsRef.current[userId]?.ids || [];
    const newIds = editor.deltaDecorations(oldIds, decorations);

    decorationIdsRef.current[userId] = { ids: newIds, color };

    // Update CSS dynamically
    if (styleRef.current) {
      let css = '';
      Object.entries(decorationIdsRef.current).forEach(([uid, { color }]) => {
        css += `
          .remote-cursor-indicator-${uid} {
            border-left: 2px solid ${color};
            margin-left: -1px;
          }
          .remote-selection-${uid} {
            background-color: ${color}33; /* 20% opacity */
          }
        `;
      });
      styleRef.current.innerHTML = css;
    }
  }, [getUserColor]);

  // Throttle cursor updates to avoid spamming
  const lastEmit = useRef(0);
  const sendCursorUpdate = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !socket || !user) return;

    const now = Date.now();
    if (now - lastEmit.current < 50) return; // 20fps
    lastEmit.current = now;

    const position = editor.getPosition();
    const selection = editor.getSelection();

    socket.emit('cursor-move', {
      cursor: { line: position.lineNumber, column: position.column },
    });

    socket.emit('selection-change', {
      selection: selection
        ? {
            startLine: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLine: selection.endLineNumber,
            endColumn: selection.endColumn,
          }
        : null,
    });
  }, [socket, user]);

  // Setup socket listeners for collaborative cursors
  useEffect(() => {
    if (!socket || !isConnected || !editorRef.current) return;
    socketRef.current = socket;
    const editor = editorRef.current;

    const posListener = editor.onDidChangeCursorPosition(sendCursorUpdate);
    const selListener = editor.onDidChangeCursorSelection(sendCursorUpdate);

    const handleCursorMove = ({ userId, cursor }) => {
      if (userId === user?._id) return;
      updateDecoration(userId, cursor, null);
    };

    const handleSelectionChange = ({ userId, selection }) => {
      if (userId === user?._id) return;
      updateDecoration(userId, null, selection);
    };

    socket.on('cursor-move', handleCursorMove);
    socket.on('selection-change', handleSelectionChange);

    return () => {
      posListener.dispose();
      selListener.dispose();
      socket.off('cursor-move', handleCursorMove);
      socket.off('selection-change', handleSelectionChange);
    };
  }, [socket, isConnected, sendCursorUpdate, updateDecoration, user]);

  // Inject style tag for cursors/selections
  useEffect(() => {
    const style = document.createElement('style');
    styleRef.current = style;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Editor
      height="100%"
      value={value}
      defaultLanguage={language}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      path={path}
      onChange={onChange}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontLigatures: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        padding: { top: 12, bottom: 12 },
      }}
    />
  );
};

export default MonacoWrapper;