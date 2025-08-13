import React, { useState, useCallback } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/components/chat/ChatMessage';

// Sample AI responses
const aiResponses = [
  "I'm here to help! What would you like to know?",
  "That's an interesting question. Let me think about that...",
  "I can help you with a wide range of topics. What's on your mind?",
  "Great question! Here's what I think about that...",
  "I'd be happy to assist you with that. Let me provide some insights.",
  "That's a fascinating topic. Here's my perspective...",
  "I can help you explore that idea further. What specific aspect interests you most?",
];

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const { user } = useAuth();

  const generateAIResponse = useCallback(() => {
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    return randomResponse;
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  }, [generateAIResponse]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader onOpenSettings={() => setIsAdminPanelOpen(true)} />
      <ChatArea messages={messages} isTyping={isTyping} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      
      {user?.isAdmin && (
        <AdminPanel 
          isOpen={isAdminPanelOpen} 
          onClose={() => setIsAdminPanelOpen(false)} 
        />
      )}
    </div>
  );
};