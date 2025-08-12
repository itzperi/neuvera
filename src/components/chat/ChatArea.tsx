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
      className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-subtle"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg"></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Welcome to NeuraChat!
            </h3>
            <p className="text-muted-foreground">
              I'm your AI assistant. How can I help you today?
            </p>
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
                id: 'typing',
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