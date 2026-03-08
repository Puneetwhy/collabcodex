// frontend/src/components/Chat/ProjectChat.jsx
import { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '../../lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const ProjectChat = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Join project chat and setup listeners
  useEffect(() => {
    if (!socket || !isConnected || !projectId) return;

    socket.emit('join-project', { projectId });

    const handleHistory = (history) => setMessages(history);
    const handleMessage = (message) => setMessages((prev) => [...prev, message]);
    const handleTyping = ({ userId, isTyping }) => {
      if (userId !== user?._id) setIsTyping(isTyping);
    };

    socket.on('chat-history', handleHistory);
    socket.on('chat-message', handleMessage);
    socket.on('user-typing', handleTyping);

    return () => {
      socket.off('chat-history', handleHistory);
      socket.off('chat-message', handleMessage);
      socket.off('user-typing', handleTyping);
    };
  }, [socket, isConnected, projectId, user]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    const content = input.trim();
    const message = {
      project: projectId,
      user: user._id,
      content,
      type: 'user',
    };

    socket.emit('send-chat', { projectId, content });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    socket?.emit('typing', { projectId, isTyping: value.trim().length > 0 });
  };

  return (
    <div className="flex flex-col h-full w-full bg-background border border-border">
      {/* Header */}
      <div className="px-3 sm:px-3 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-1 tracking-tight">
            <Smile size={18} className="text-primary text-amber-600 " /> Project Chat
          </h3>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 sm:px-6 py-6" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <Smile size={44} className="mb-4 opacity-40 text-amber-500" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-2">Start the conversation 🚀</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={cn('flex', msg.user?._id === user?._id ? 'justify-end' : 'justify-start')}
              >
                {msg.type === 'system' ? (
                  <div className="text-[11px] sm:text-xs text-center w-full text-muted-foreground italic py-2">
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'flex gap-3 max-w-[92%] sm:max-w-[80%] lg:max-w-[70%]',
                      msg.user?._id === user?._id ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 shrink-0">
                      {msg.user?.avatar ? (
                        <AvatarImage src={msg.user.avatar} />
                      ) : (
                        <AvatarFallback>{msg.user?.username?.[0] || '?'}</AvatarFallback>
                      )}
                    </Avatar>

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed break-words',
                        msg.user?._id === user?._id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted/70 rounded-bl-md'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                        <span className="font-medium text-foreground">{msg.user?.username || 'Anonymous'}</span>
                        <span className="opacity-60">{msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="mt-4 text-xs text-muted-foreground italic px-2">
            Someone is typing...
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="px-4 sm:px-6 py-4 border-t border-border bg-background">
        <div className="flex items-center gap-2 sm:gap-3">
          <Input
            placeholder="Type a message... (Shift+Enter for new line)"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full px-4 py-2 text-sm shadow-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full h-10 w-10 shrink-0 shadow-sm"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 text-center">
          @username to mention • Messages are persistent
        </p>
      </div>
    </div>
  );
};

export default ProjectChat;