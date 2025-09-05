import React, { useState, useCallback, useEffect } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { trackingClient } from '@/lib/trackingClient';
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
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const { user } = useAuth();

  // Fetch messages from the database
  const { data: messagesData = [], isLoading } = useQuery({
    queryKey: ['/api/messages', user?.id.toString()],
    queryFn: () => user ? apiRequest(`/api/messages/${user.id}`) : Promise.resolve({ messages: [] }),
    enabled: !!user,
  });

  const messages = messagesData.messages || [];

  // Mutation for creating messages
  const createMessageMutation = useMutation({
    mutationFn: (messageData: { userId: string; content: string; isUser: boolean }) =>
      apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', user?.id.toString()] });
    },
  });

  const generateAIResponse = useCallback(() => {
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    return randomResponse;
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user) return;

    // Track chat interaction
    trackingClient.trackChatInteraction({
      messageLength: content.length,
      type: 'user_message',
    });

    // Create user message
    const userMessageData = {
      userId: user.id.toString(),
      content,
      isUser: true,
    };

    try {
      // Save user message and get AI response
      const startTime = Date.now();
      const response = await createMessageMutation.mutateAsync(userMessageData);
      const responseTime = Date.now() - startTime;

      // Track AI response if available
      if (response.aiMessage) {
        trackingClient.trackChatInteraction({
          responseTime,
          messageLength: response.aiMessage.content.length,
          type: 'ai_response',
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      trackingClient.trackEvent('chat_error', { error: error.message });
    }
  }, [createMessageMutation, user]);

  return (
    <div className="h-screen chat-container flex flex-col bg-background">
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