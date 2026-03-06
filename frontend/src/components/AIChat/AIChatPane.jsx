// frontend/src/components/AIChat/AIChatPane.jsx
import { useState, useRef, useEffect } from 'react';
import { Send, Code, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '../ui/scroll-area.jsx';
import { cn } from '../../lib/utils/utils.js';
import { useTheme } from '@/hooks/useTheme';

// Backend AI endpoint
const AI_ENDPOINT = '/api/ai/chat';

const AIChatPane = ({ selectedCode = '', onInsertCode }) => {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content:
        'You are an expert coding assistant in CollabCodeX. Be concise, helpful, and accurate.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const { theme } = useTheme();

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedCode.trim()) return;

    const userMessage = selectedCode.trim()
      ? `${input.trim()}\n\n\`\`\`\n${selectedCode}\n\`\`\``
      : input.trim();

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          model: 'llama3-70b-8192',
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      // Placeholder assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              aiResponse += token;

              // Update last message live
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = aiResponse;
                return updated;
              });
            } catch {}
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to get AI response');
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Explain', icon: <Code size={16} />, prompt: 'Explain this code step by step:' },
    { label: 'Fix', icon: <AlertCircle size={16} />, prompt: 'Find and fix bugs in this code:' },
    { label: 'Generate Tests', icon: <Sparkles size={16} />, prompt: 'Write comprehensive unit tests for this code:' },
    { label: 'Improve', icon: <Sparkles size={16} />, prompt: 'Suggest improvements and refactor this code:' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background border-l border-border">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-base sm:text-lg tracking-tight">
              AI Assistant
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              Smart coding help inside your workspace
            </p>
          </div>
          <span className="hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
            Groq / OpenAI
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 sm:px-6 py-5">
        <div className="space-y-5 sm:space-y-6">
          {messages.slice(1).map((msg, idx) => (
            <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'w-fit max-w-[92%] sm:max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted/70 rounded-bl-md'
                )}
              >
                {msg.content.split('\n').map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.startsWith('```')
                        ? 'font-mono text-xs bg-background/60 border border-border p-2 rounded-md my-2 overflow-x-auto'
                        : 'mb-1 last:mb-0'
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 text-destructive text-xs sm:text-sm px-4 py-2 rounded-lg border border-destructive/30 text-center">
                {error}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 py-3 border-t border-border bg-background">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="sm"
              className="gap-1.5 rounded-full text-xs font-medium shadow-sm whitespace-nowrap"
              onClick={() => {
                setInput(action.prompt);
                if (selectedCode.trim()) handleSend();
              }}
              disabled={isLoading}
            >
              {action.icon} {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-border bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <Input
            placeholder="Ask AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-full px-4 py-2 text-sm shadow-sm"
          />

          <Button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedCode.trim())}
            className="rounded-full h-10 w-10 p-0 shrink-0 shadow-sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
          </Button>
        </form>

        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-3 text-center">
          Selected code is automatically included
        </p>
      </div>
    </div>
  );
};

export default AIChatPane;