// frontend/src/components/Project/PushReviewCard.jsx
import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, X, MessageSquare, GitBranch } from 'lucide-react';
import { useAcceptMergeMutation, useRejectMergeMutation } from '@/features/project/projectApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PushReviewCard = ({ mergeRequest, projectId, onClose }) => {
  const { user } = useAuth();
  const [acceptMerge, { isLoading: accepting }] = useAcceptMergeMutation();
  const [rejectMerge, { isLoading: rejecting }] = useRejectMergeMutation();

  const isOwner = user?._id === mergeRequest?.project?.owner?._id;

  const handleAccept = async () => {
    try {
      await acceptMerge({ projectId, mrId: mergeRequest._id }).unwrap();
      toast.success('Changes merged successfully');
      onClose?.();
    } catch (err) {
      toast.error('Failed to merge: ' + (err.data?.message || err.message));
    }
  };

  const handleReject = async () => {
    try {
      await rejectMerge({ projectId, mrId: mergeRequest._id }).unwrap();
      toast.success('Push rejected');
      onClose?.();
    } catch (err) {
      toast.error('Failed to reject: ' + (err.data?.message || err.message));
    }
  };

  const handleEditorMount = (editor) => {
    editor.updateOptions({ readOnly: true });
    editor.revealLine(1);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border border-border/60 shadow-lg rounded-2xl bg-background">
      {/* HEADER */}
      <CardHeader className="pb-4 border-b bg-muted/30 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={mergeRequest.author?.avatar} />
              <AvatarFallback>{mergeRequest.author?.username?.[0] || '?'}</AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                {mergeRequest.title}
              </CardTitle>

              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>Proposed by</span>
                <span className="font-medium text-foreground">{mergeRequest.author?.username || 'Unknown'}</span>
                <span>•</span>
                <span>{mergeRequest.filesChanged?.length || 0} files changed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 flex items-center">
              <GitBranch size={12} />
              Draft Review
            </Badge>

            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* DIFF VIEW */}
      <CardContent className="flex-1 p-0 overflow-hidden bg-background">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontSize: 13,
          }}
          original={mergeRequest.originalContent || '// Main version (before push)'}
          modified={mergeRequest.proposedContent || '// Proposed changes'}
          onMount={handleEditorMount}
        />
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="border-t px-6 py-4 bg-muted/20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare size={14} />
          <span>Inline comments coming soon</span>
        </div>

        {isOwner && (
          <div className="flex gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={rejecting || accepting}
              className="shadow-sm"
            >
              <X size={16} className="mr-2" />
              Reject
            </Button>

            <Button
              size="sm"
              onClick={handleAccept}
              disabled={rejecting || accepting}
              className="shadow-sm"
            >
              <Check size={16} className="mr-2" />
              Accept & Merge
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PushReviewCard;