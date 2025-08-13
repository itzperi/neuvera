import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  illustration?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  illustration 
}) => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Illustration Card */}
        {illustration && (
          <div className="bg-card rounded-2xl p-8 mb-6 shadow-luxury text-center animate-fade-in">
            {illustration}
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        )}
        
        {/* Auth Form Card */}
        <div className="bg-card rounded-2xl p-8 shadow-luxury animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
      </div>
    </div>
  );
};