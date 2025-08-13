import React from 'react';
import { Moon, Sun, Settings, LogOut, User } from 'lucide-react';
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
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-elegant">
      <div className="flex items-center gap-3">
        {/* Logo/Brand */}
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
          <div className="w-6 h-6 bg-primary-foreground rounded-sm"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">NeuraChat</h1>
          <p className="text-sm text-muted-foreground">AI Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
          <User size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{user?.username}</span>
          {user?.isAdmin && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md">
              ADMIN
            </span>
          )}
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-foreground" />
          ) : (
            <Moon size={20} className="text-foreground" />
          )}
        </Button>

        {/* Settings */}
        {user?.isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="hover:bg-muted transition-colors"
          >
            <Settings size={20} className="text-foreground" />
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  );
};