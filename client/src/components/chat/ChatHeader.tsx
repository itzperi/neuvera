import React from 'react';
import { ArrowLeft, MoreHorizontal, Moon, Sun, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface ChatHeaderProps {
  onOpenSettings?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenSettings }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="p-2 lg:hidden">
          <ArrowLeft size={18} className="text-foreground" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-md">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">NeuraChat AI</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Mental wellness support</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 hover:bg-muted/50 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-foreground" />
          ) : (
            <Moon size={18} className="text-foreground" />
          )}
        </Button>

        {/* Settings */}
        {user?.isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="p-2 hover:bg-muted/50 transition-colors"
          >
            <Settings size={18} className="text-foreground" />
          </Button>
        )}

        {/* More options */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-muted/50 transition-colors"
        >
          <MoreHorizontal size={18} className="text-foreground" />
        </Button>
      </div>
    </header>
  );
};