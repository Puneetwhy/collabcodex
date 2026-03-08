// frontend/src/components/Editor/FileTree.jsx
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

const FileTree = ({ files, onFileSelect, selectedPath, projectId }) => {
  const [expanded, setExpanded] = useState(new Set());
  const { socket } = useSocket(projectId);

  // Build tree from files object
  const buildTree = (fileMap) => {
    const root = { children: {}, type: 'folder', path: '' };
    Object.keys(fileMap).forEach((path) => {
      const parts = path.split('/');
      let current = root;
      parts.forEach((part, i) => {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: i === parts.length - 1 ? path : `${current.path ? current.path + '/' : ''}${part}`,
            type: i === parts.length - 1 ? 'file' : 'folder',
            children: i === parts.length - 1 ? null : {},
          };
        }
        current = current.children[part];
      });
    });
    return root;
  };

  const tree = buildTree(files);

  const toggleFolder = (path) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  // ===================== CREATE FILE/FOLDER =====================
  const handleCreate = (type, parentPath = '') => {
    const name = prompt(`Enter ${type} name:`);
    if (!name?.trim()) return;
    const path = parentPath ? `${parentPath}/${name.trim()}` : name.trim();
    socket?.emit('create-item', { projectId, path, type, content: type === 'file' ? '// New file' : null });
    toast.success(`${type === 'file' ? 'File' : 'Folder'} "${name}" created`);
  };

  // ===================== UPLOAD FOLDER =====================
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      const items = [];

      for (const file of files) {
        const content = await file.text();
        const relativePath = file.webkitRelativePath;
        items.push({ path: relativePath, content });
      }

      socket?.emit('upload-folder', { projectId, items });
      toast.success('Folder uploaded!');
    };

    input.click();
  };

  // ===================== DRAG & DROP =====================
  const handleDrop = (e) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return toast.error('No files dropped');

    const uploadItems = [];

    const processDir = (entry, path = '') => {
      const reader = entry.createReader();
      reader.readEntries((entries) => {
        entries.forEach((ent) => {
          if (ent.isDirectory) processDir(ent, `${path}/${ent.name}`);
          else processFile(ent, path);
        });
      });
    };

    const processFile = (fileEntry, path = '') => {
      fileEntry.file((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fullPath = path ? `${path}/${file.name}` : file.name;
          uploadItems.push({ path: fullPath, content: e.target.result });
          if (uploadItems.length === e.dataTransfer.files.length) {
            socket?.emit('upload-folder', { projectId, items: uploadItems });
            toast.success('Folder uploaded!');
          }
        };
        reader.readAsText(file);
      });
    };

    for (let item of items) {
      const entry = item.webkitGetAsEntry();
      if (!entry) continue;
      entry.isDirectory ? processDir(entry) : processFile(entry);
    }
  };

  // ===================== RENDER TREE =====================
  const renderNode = (node, prefix = '') => {
    return Object.entries(node.children || {}).map(([name, data]) => {
      const fullPath = prefix ? `${prefix}/${name}` : name;
      const isFolder = data.type === 'folder';
      const isExpanded = expanded.has(fullPath);
      const isSelected = fullPath === selectedPath;

      return (
        <ContextMenu key={fullPath}>
          <ContextMenuTrigger>
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors',
                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              )}
              onClick={() => (isFolder ? toggleFolder(fullPath) : onFileSelect(fullPath))}
            >
              {isFolder ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-3.5" />}
              {isFolder ? <Folder size={16} className="text-blue-500" /> : <File size={16} className="text-gray-500" />}
              <span className="text-sm truncate">{name}</span>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onClick={() => handleCreate('file', fullPath)}>New File</ContextMenuItem>
            <ContextMenuItem onClick={() => handleCreate('folder', fullPath)}>New Folder</ContextMenuItem>
            <ContextMenuItem onClick={() => handleUpload()}>Upload Folder</ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                const newName = prompt('Rename to:', name);
                if (newName?.trim() && newName !== name) {
                  socket?.emit('rename-item', {
                    projectId,
                    oldPath: fullPath,
                    newPath: prefix ? `${prefix}/${newName}` : newName,
                  });
                }
              }}
            >
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm(`Delete "${name}"?`)) socket?.emit('delete-item', { projectId, path: fullPath });
              }}
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>

          {isFolder && isExpanded && data.children && <div className="ml-4 border-l border-border/40 pl-2">{renderNode(data, fullPath)}</div>}
        </ContextMenu>
      );
    });
  };

  return (
    <div className="h-full overflow-auto bg-card border-r border-border p-2" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-card z-10 py-1">
        <h3 className="font-medium text-sm">Explorer</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Plus size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCreate('file')}>New File</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreate('folder')}>New Folder</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpload()}>Upload Folder</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.keys(tree.children || {}).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-sm text-muted-foreground">
          <Folder size={32} className="opacity-40 mb-2" />
          <p>Drop folder here</p>
          <p className="text-xs mt-1">or click + to create / upload</p>
        </div>
      ) : (
        <div className="space-y-0.5">{renderNode(tree)}</div>
      )}
    </div>
  );
};

export default FileTree;