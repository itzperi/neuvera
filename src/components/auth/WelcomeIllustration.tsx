import React from 'react';

export const WelcomeIllustration: React.FC = () => {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-8 w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-12 w-2 h-2 bg-primary-glow/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-8 left-4 w-4 h-4 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-8 right-8 w-8 h-8 bg-gradient-primary rounded-lg transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-12 right-16 w-6 h-6 border-2 border-primary rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute top-20 left-12 w-1 h-12 bg-primary/30 rounded-full transform rotate-12"></div>
        <div className="absolute bottom-20 left-8 w-1 h-8 bg-primary-glow/40 rounded-full transform -rotate-12"></div>
      </div>
      
      {/* Main Character */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Character body */}
        <div className="relative">
          {/* Head */}
          <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-2 shadow-glow"></div>
          
          {/* Body */}
          <div className="w-12 h-20 bg-primary rounded-lg mx-auto shadow-elegant">
            {/* Arms */}
            <div className="absolute -left-3 top-2 w-6 h-6 bg-primary-glow rounded-full"></div>
            <div className="absolute -right-3 top-2 w-6 h-6 bg-primary-glow rounded-full"></div>
          </div>
          
          {/* Legs */}
          <div className="flex justify-center gap-2 mt-1">
            <div className="w-4 h-8 bg-primary rounded-lg"></div>
            <div className="w-4 h-8 bg-primary rounded-lg"></div>
          </div>
        </div>
        
        {/* Floating chat bubble */}
        <div className="absolute -top-8 -right-8 bg-card border-2 border-primary/20 rounded-lg p-2 shadow-elegant animate-pulse">
          <div className="w-2 h-2 bg-primary rounded-full inline-block mr-1"></div>
          <div className="w-2 h-2 bg-primary/60 rounded-full inline-block mr-1"></div>
          <div className="w-2 h-2 bg-primary/30 rounded-full inline-block"></div>
        </div>
      </div>
    </div>
  );
};