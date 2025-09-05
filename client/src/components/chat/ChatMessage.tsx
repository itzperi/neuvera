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
    <div className={`flex gap-3 mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white dark:border-gray-700">
          <Bot size={16} className="text-white" />
        </div>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${message.isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            message.isUser
              ? 'bg-primary text-primary-foreground rounded-br-lg'
              : 'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1 py-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse opacity-60"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse opacity-80" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
        </div>
        {!isTyping && (
          <span className="text-xs text-muted-foreground mt-1 px-2">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {message.isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white dark:border-gray-700">
          <User size={16} className="text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
};