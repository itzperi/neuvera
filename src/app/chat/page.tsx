"use client";

import { useRouter } from 'next/navigation';
import ChatbotInterface from '@/components/chatbot-interface';
import { useAuth } from '@clerk/nextjs';

export default function ChatPage() {
  const router = useRouter();
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  
  // Check authentication status
  if (isLoaded && !userId) {
    router.push('/auth/signin');
    return null;
  }
  
  const handleNavigation = (view: string) => {
    router.push(`/?view=${view}`);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <ChatbotInterface 
        isAuthenticated={true}
        onNavigate={handleNavigation}
      />
    </div>
  );
}