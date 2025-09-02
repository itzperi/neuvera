"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, LayoutDashboard, BrainCog, MonitorSmartphone } from "lucide-react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { authService } from "@/services/auth-service";

interface LandingPageProps {
  onNavigate?: (view: string) => void;
  isAuthenticated?: boolean;
  userRole?: "user" | "admin" | null;
}

export default function LandingPage({ onNavigate, isAuthenticated, userRole }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use the imported authService singleton
  const { isSignedIn } = useAuth();

  const handleTryNeuvera = () => {
    if (isSignedIn || isAuthenticated) {
      onNavigate?.("chat");
    }
    // If not authenticated, the button will be wrapped with SignInButton
  };

  const handleAdminAccess = async () => {
    setIsLoading(true);
    try {
      const result = await authService.login({
        email: username, // Using username field as email
        password: password
      });
      
      if (result.isAuthenticated) {
        toast.success("Admin access granted!");
        setIsAdminDialogOpen(false);
        
        // Store admin authentication in localStorage for persistence
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        // Navigate to admin panel
        onNavigate?.("admin");
        
        // If using Next.js router directly
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Authentication failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = async () => {
    // Hardcoded admin credentials
    const adminUsername = 'neuvera';
    const adminPassword = '1234@';
    
    try {
      // Attempt direct login with hardcoded credentials
      const result = await authService.login({
        email: adminUsername,
        password: adminPassword
      });
      
      if (result.isAuthenticated) {
        toast.success("Admin access granted!");
        
        // Store admin authentication in localStorage for persistence
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        // Navigate to admin panel
        onNavigate?.("admin");
        
        // If using Next.js router directly
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      } else {
        // If direct login fails, show the dialog as fallback
        setIsAdminDialogOpen(true);
      }
    } catch (error) {
      console.error("Direct admin login failed:", error);
      // Show dialog as fallback if direct login fails
      setIsAdminDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation Header */}
      <nav className="relative z-50 border-b border-border/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-foreground">Neuvera.ai</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              {!isAuthenticated && !isSignedIn && (
                <div className="flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
              {isAuthenticated || isSignedIn ? (
                <Button 
                  onClick={handleTryNeuvera}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Open Chat
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Try Neuvera
                  </Button>
                </SignInButton>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`h-0.5 bg-foreground transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`h-0.5 bg-foreground transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`h-0.5 bg-foreground transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border/10 py-4">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                {!isAuthenticated && !isSignedIn && (
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                )}
                {isAuthenticated || isSignedIn ? (
                  <Button 
                    onClick={handleTryNeuvera}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Open Chat
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Try Neuvera
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-primary/8 rounded-full blur-lg animate-pulse delay-500" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
              <BrainCog className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your AI Assistant for
              <span className="block text-transparent bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
                Complete Task Mastery
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Neuvera.ai revolutionizes how you approach assignments and complex tasks. Our intelligent AI assistant 
              provides personalized guidance, detailed explanations, and step-by-step solutions to help you excel 
              in your academic and professional endeavors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleTryNeuvera}
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                {isAuthenticated ? "Open Chat" : "Try Neuvera"}
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:bg-secondary text-foreground px-8 py-3 text-lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Every Task
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how Neuvera.ai transforms complex challenges into manageable solutions with cutting-edge AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card border border-border/10 hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Intelligent Analysis</h3>
              <p className="text-muted-foreground">
                Advanced AI algorithms analyze your assignments and provide comprehensive insights to guide your approach.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border/10 hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Step-by-Step Guidance</h3>
              <p className="text-muted-foreground">
                Break down complex problems into manageable steps with detailed explanations for each phase.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border/10 hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MonitorSmartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Multi-Platform Access</h3>
              <p className="text-muted-foreground">
                Access your AI assistant anywhere, anytime across all your devices with seamless synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who have revolutionized their approach to complex tasks with Neuvera.ai.
          </p>
          <Button 
            onClick={handleTryNeuvera}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
          >
            {isAuthenticated ? "Open Chat" : "Get Started Now"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <button 
                  onClick={handleLogoClick}
                  className="flex items-center space-x-2 group"
                >
                  <Brain className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
                  <span className="text-lg font-semibold text-foreground group-hover:text-muted-foreground transition-colors">Neuvera.ai</span>
                </button>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering minds with intelligent AI assistance for academic and professional excellence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <button
                  onClick={handleTryNeuvera}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Try Now
                </button>
                <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="#about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
                <Link href="/status" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Status
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/10 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Neuvera.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Admin Access Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAdminAccess}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Access Admin Panel"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdminDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}