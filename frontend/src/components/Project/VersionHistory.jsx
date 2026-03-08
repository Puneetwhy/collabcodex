// frontend/src/components/Project/VersionHistory.jsx
import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@/hooks/useAuth';
import { useGetVersionsQuery, useRollbackVersionMutation } from '@/features/project/projectApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { History, RotateCcw, AlertTriangle, GitCommit } from 'lucide-react';
import { format } from 'date-fns';

const VersionHistory = ({ projectId, open, onOpenChange }) => {
  const { user } = useAuth();
  const { data: versions = [], isLoading } = useGetVersionsQuery(projectId);
  const [rollbackVersion, { isLoading: rollingBack }] = useRollbackVersionMutation();
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Sort versions newest first
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [versions]
  );

  const latestVersionNumber = useMemo(
    () => Math.max(...sortedVersions.map(v => v.versionNumber), 0),
    [sortedVersions]
  );

  const handleRollback = async (versionId) => {
    try {
      await rollbackVersion({ projectId, versionId }).unwrap();
      toast.success('Project rolled back successfully');
      setSelectedVersion(null);
    } catch (err) {
      toast.error('Rollback failed: ' + (err.data?.message || 'Unknown error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* HEADER */}
        <DialogHeader className="px-8 pt-8 pb-5 border-b bg-muted/30 backdrop-blur">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
            <History size={26} className="text-primary" />
            Version History
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            View previous stable versions and rollback safely.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <div className="w-96 border-r bg-muted/10 flex flex-col">
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-6 space-y-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : sortedVersions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <History size={56} className="mb-5 opacity-40" />
                  <p className="font-medium">No versions yet</p>
                  <p className="text-sm mt-2">Merge changes to create project history.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sortedVersions.map(version => (
                    <div
                      key={version._id}
                      onClick={() => setSelectedVersion(version)}
                      className={`px-6 py-5 cursor-pointer transition-all duration-150
                        hover:bg-accent/40
                        ${selectedVersion?._id === version._id ? 'bg-accent shadow-inner' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <GitCommit size={16} className="text-muted-foreground mt-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">Version {version.versionNumber}</p>
                              {version.versionNumber === latestVersionNumber && (
                                <Badge variant="default" className="text-xs">Latest</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {version.message || 'Merged changes'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          <div>{format(new Date(version.createdAt), 'MMM d, yyyy')}</div>
                          <div className="mt-1">{format(new Date(version.createdAt), 'HH:mm')}</div>
                          <div className="mt-2">
                            by {version.committedBy?.username || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 flex flex-col bg-background">
            {selectedVersion ? (
              <>
                {/* VERSION HEADER */}
                <div className="px-8 py-6 border-b bg-muted/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Version {selectedVersion.versionNumber}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedVersion.message || 'No commit message'}
                    </p>
                  </div>

                  {user._id === selectedVersion.committedBy?._id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="shadow-sm">
                          <RotateCcw size={16} className="mr-2" />
                          Rollback
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
                          <AlertDialogDescription className="text-destructive flex items-start gap-2">
                            <AlertTriangle size={18} className="mt-1" />
                            <span>
                              This will revert Main to version {selectedVersion.versionNumber}. Unpushed changes will be lost.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRollback(selectedVersion._id)}
                            disabled={rollingBack}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {rollingBack ? 'Rolling back...' : 'Confirm Rollback'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {/* MONACO DIFF VIEW */}
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                    }}
                    original={selectedVersion.previousMainContent || '// Previous Main version'}
                    modified={selectedVersion.filesContent || '// This version content'}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center px-10">
                <History size={70} className="mb-6 opacity-40" />
                <h3 className="text-xl font-semibold">Select a version</h3>
                <p className="mt-3 max-w-md text-sm">
                  Choose a version from the left panel to preview its diff and optionally rollback.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistory;