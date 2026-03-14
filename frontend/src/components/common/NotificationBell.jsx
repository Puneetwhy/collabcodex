// frontend/src/components/common/NotificationBell.jsx
import { useEffect, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSocket } from '@/hooks/useSocket';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from '@/features/notifications/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NotificationBell = () => {
  const { socket } = useSocket();

  const { data, isLoading } = useGetNotificationsQuery();
  const notifications = Array.isArray(data)
    ? data
    : data?.notifications ?? [];

  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    if (!socket) return;

    const handleNotif = (newNotif) => {
      toast.info(newNotif.message, { description: 'New notification' });
      // Optional: play a sound for real-time alert
      // new Audio('/notification.mp3').play();
    };

    socket.on('notification', handleNotif);
    return () => socket.off('notification', handleNotif);
  }, [socket]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id).unwrap();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                'absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full text-[10px] flex items-center justify-center shadow-sm transition-transform duration-150',
                'animate-pulse'
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 shadow-xl backdrop-blur bg-background/95"
      >
        <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold tracking-tight">
          Notifications
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif._id}
                className={cn(
                  'flex flex-col items-start gap-1 px-4 py-3 cursor-pointer transition-colors',
                  'focus:bg-muted hover:bg-muted',
                  !notif.read && 'bg-accent/20 border-l-2 border-accent/60'
                )}
                onClick={() => {
                  if (!notif.read) handleMarkRead(notif._id);
                  if (notif.link) window.location.href = notif.link;
                }}
              >
                <div className="text-sm font-medium leading-snug">
                  {notif.message}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;