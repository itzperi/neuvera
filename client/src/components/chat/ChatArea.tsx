import React, { useEffect, useRef } from 'react';
import { ChatMessage, type Message } from './ChatMessage';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-br from-background via-background to-muted/20"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md px-6">
            {/* Bot Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full"></div>
              </div>
            </div>
            
            {/* Welcome Message */}
            <h2 className="text-2xl font-bold text-foreground mb-3">
              How can I help you today?
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              I'm your AI mental wellness assistant. Start a conversation or try one of the suggestions below.
            </p>
            
            {/* Recent queries section */}
            <div className="text-left">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
                Recent queries
              </h3>
              <div className="space-y-3">
                {[
                  { icon: "💬", text: "I'm feeling anxious about work", category: "stress" },
                  { icon: "🎯", text: "Help me set daily goals", category: "productivity" },
                  { icon: "💭", text: "I need someone to talk to", category: "support" }
                ].map((query, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer border border-border/50"
                  >
                    <span className="text-lg">{query.icon}</span>
                    <span className="text-sm text-muted-foreground">{query.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <ChatMessage
              message={{
                id: -1,
                userId: '0',
                content: '',
                isUser: false,
                timestamp: new Date()
              }}
              isTyping={true}
            />
          )}
        </div>
      )}
    </div>
  );
};