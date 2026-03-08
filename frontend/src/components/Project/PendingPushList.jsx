// frontend/src/components/Project/PendingPushList.jsx
import { useGetMergeRequestsQuery } from '@/features/project/projectApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, GitPullRequest, FileDiff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PendingPushList = ({ projectId, onSelectMr }) => {
  const { data: mergeRequests = [], isLoading } = useGetMergeRequestsQuery(projectId);

  // Filter only open or draft merge requests
  const pending = mergeRequests.filter(mr => mr.status === 'open' || mr.status === 'draft');

  // Loading placeholder
  const renderLoading = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          Pending Pushes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </CardContent>
    </Card>
  );

  // Empty state
  const renderEmpty = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          Pending Pushes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
        <GitPullRequest size={36} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">No pending pushes</p>
        <p className="text-xs">Team members' changes will appear here</p>
      </CardContent>
    </Card>
  );

  // Render list of pending merge requests
  const renderList = () => (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <GitPullRequest size={16} className="opacity-70" />
          Pending Pushes
          <span className="text-muted-foreground text-sm font-normal">
            ({pending.length})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/60 max-h-[calc(100vh-200px)] overflow-auto">
          {pending.map(mr => {
            const changesCount =
              mr.diff?.split('\n').filter(l => l.startsWith('+') || l.startsWith('-')).length || 0;

            return (
              <div
                key={mr._id}
                onClick={() => onSelectMr(mr)}
                className={cn(
                  'group p-4 cursor-pointer transition-colors duration-150',
                  'hover:bg-muted/60'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Author & Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mr.author?.avatar} />
                      <AvatarFallback>{mr.author?.username?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{mr.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Opened by {mr.author?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Files changed badge */}
                  <Badge variant="outline" className="text-xs shrink-0">
                    {mr.filesChanged?.length || 0} files
                  </Badge>
                </div>

                {/* Timestamp & changes count */}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="opacity-60" />
                    {formatDistanceToNow(new Date(mr.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileDiff size={12} className="opacity-60" />
                    {changesCount} changes
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) return renderLoading();
  if (pending.length === 0) return renderEmpty();
  return renderList();
};

export default PendingPushList;