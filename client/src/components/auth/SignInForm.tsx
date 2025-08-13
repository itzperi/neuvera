import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SignInFormProps {
  onToggleMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onToggleMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "Welcome back!",
          description: `Successfully logged in${username === 'neuvera' ? ' as admin' : ''}.`,
        });
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Sign In</h2>
        <p className="text-muted-foreground">Please enter the details below to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-12 bg-muted/50 border-border focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <button
              type="button"
              className="text-primary hover:text-primary-glow text-sm transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 bg-muted/50 border-border focus:border-primary transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="premium" 
          size="lg" 
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'LOGIN'}
        </Button>
      </form>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          Having issues?{' '}
          <button className="text-primary hover:text-primary-glow transition-colors">
            Contact Us
          </button>
        </p>
        <p className="text-muted-foreground">
          New Here?{' '}
          <button 
            onClick={onToggleMode}
            className="text-primary hover:text-primary-glow transition-colors"
          >
            Create Account
          </button>
        </p>
      </div>
      
      {/* Demo credentials hint */}
      <div className="text-xs text-center text-muted-foreground bg-muted/30 rounded-lg p-3">
        <p className="font-medium mb-1">Demo Credentials:</p>
        <p>Admin: neuvera / 1234</p>
        <p>User: any username / any password</p>
      </div>
    </div>
  );
};