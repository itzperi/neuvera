import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { WelcomeIllustration } from '@/components/auth/WelcomeIllustration';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleMode = () => setIsSignIn(!isSignIn);

  return (
    <AuthLayout
      title={isSignIn ? "Welcome to NeuraChat!" : "Join NeuraChat!"}
      subtitle={isSignIn ? "Let's get you signed in to continue your AI journey." : "Create your account and start exploring AI possibilities."}
      illustration={<WelcomeIllustration />}
    >
      {isSignIn ? (
        <SignInForm onToggleMode={toggleMode} />
      ) : (
        <SignUpForm onToggleMode={toggleMode} />
      )}
    </AuthLayout>
  );
};