import React from 'react';
import { Bot, User } from 'lucide-react';

export interface Message {
  id: number;
  userId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping }) => {
  return (
    <div className={`flex gap-3 mb-6 animate-fade-in ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && (
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow flex-shrink-0">
          <Bot size={20} className="text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-elegant ${
            message.isUser
              ? 'bg-chat-user-bg text-chat-user-text rounded-br-md'
              : 'bg-chat-bot-bg text-chat-bot-text rounded-bl-md'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            <p className="leading-relaxed">{message.content}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {message.isUser && (
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
};