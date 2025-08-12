import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { ChatPage } from './ChatPage';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <ChatPage /> : <AuthPage />;
};

export default Index;
