// frontend/src/components/Editor/FileTree.jsx
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

const FileTree = ({ files, onFileSelect, selectedPath }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Build hierarchical tree from flat paths
  const buildTree = (paths) => {
    const root = { children: {}, type: 'folder' };

    paths.forEach((path) => {
      const parts = path.split('/');
      let current = root;

      parts.forEach((part, i) => {
        if (!current.children[part]) {
          current.children[part] = {
            children: i < parts.length - 1 ? {} : null,
            type: i < parts.length - 1 ? 'folder' : 'file',
            path,
          };
        }
        current = current.children[part];
      });
    });

    return root.children;
  };

  // Recursively render tree nodes
  const renderNode = (node, prefix = '') => {
    return Object.entries(node).map(([name, data]) => {
      const fullPath = prefix ? `${prefix}/${name}` : name;
      const isFolder = data.type === 'folder';
      const isExpanded = expandedFolders.has(fullPath);
      const isSelected = fullPath === selectedPath;

      return (
        <div key={fullPath} className="select-none">
          <div
            className={`
              group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer
              transition-colors duration-150
              ${isSelected
                ? 'bg-muted text-foreground'
                : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'}
            `}
            onClick={() => {
              if (isFolder) {
                setExpandedFolders((prev) => {
                  const next = new Set(prev);
                  next.has(fullPath) ? next.delete(fullPath) : next.add(fullPath);
                  return next;
                });
              } else {
                onFileSelect(fullPath);
              }
            }}
          >
            {/* Folder/Expand Icon */}
            {isFolder ? (
              isExpanded ? (
                <ChevronDown size={14} className="opacity-60" />
              ) : (
                <ChevronRight size={14} className="opacity-60" />
              )
            ) : (
              <div className="w-[14px]" /> 
            )}

            {/* File/Folder Icon */}
            {isFolder ? (
              <Folder size={16} className="opacity-70" />
            ) : (
              <File size={16} className="opacity-60" />
            )}

            <span className="text-sm truncate">{name}</span>
          </div>

          {/* Recursive children */}
          {isFolder && isExpanded && data.children && (
            <div className="ml-4 border-l border-border/40 pl-3">
              {renderNode(data.children, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  const treeData = buildTree(Array.from(files?.keys() || []));

  return (
    <div className="h-full overflow-auto bg-background border-r border-border/60 p-2">
      {Object.keys(treeData).length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          No files yet
        </div>
      ) : (
        renderNode(treeData)
      )}
    </div>
  );
};

export default FileTree;