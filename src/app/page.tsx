"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingPage from "@/components/landing-page";
import AuthForms from "@/components/auth-forms";
import ChatbotInterface from "@/components/chatbot-interface";
import AdminPanel from "@/components/admin-panel";
import TrackingPixel from "@/components/tracking-pixel";
import { useAuth } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<string>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const { isSignedIn, isLoaded } = useAuth();

  // Handle routing and view management
  useEffect(() => {
    const path = window.location.pathname;
    const view = searchParams.get("view");
    
    // Determine current view based on URL
    if (path === "/chat" || view === "chat") {
      setCurrentView("chat");
    } else if (path === "/auth/signin" || path === "/auth/signup" || view === "auth") {
      setCurrentView("auth");
    } else if (path === "/admin" || view === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("landing");
    }
    
    // Check for Clerk authentication status
    if (isLoaded && isSignedIn) {
      setIsAuthenticated(true);
      setUserRole("user"); // Default role, can be updated based on your user data
    }
  }, [searchParams, isLoaded, isSignedIn]);

  // Handle authentication state
  const handleAuthSuccess = (role: "user" | "admin" = "user") => {
    setIsAuthenticated(true);
    setUserRole(role);
    
    if (role === "admin") {
      setCurrentView("admin");
      router.push("/admin");
    } else {
      setCurrentView("chat");
      router.push("/chat");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentView("landing");
    router.push("/");
  };

  // Handle navigation between views
  const handleNavigation = (view: string) => {
    setCurrentView(view);
    
    switch (view) {
      case "landing":
        router.push("/");
        break;
      case "auth":
        router.push("/auth/signin");
        break;
      case "chat":
        if (!isAuthenticated && !isSignedIn) {
          setCurrentView("auth");
          router.push("/auth/signin");
        } else {
          router.push("/chat");
        }
        break;
      case "admin":
        router.push("/admin");
        break;
      default:
        router.push("/");
    }
  };

  // Render appropriate view based on current state
  const renderCurrentView = () => {
    switch (currentView) {
      case "auth":
        return (
          <AuthForms 
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigation}
          />
        );
      
      case "chat":
        if (!isAuthenticated && !isSignedIn) {
          setCurrentView("auth");
          router.push("/auth/signin");
          return null;
        }
        return (
          <div className="h-screen flex flex-col">
            <ChatbotInterface 
              isAuthenticated={isAuthenticated || isSignedIn}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
            />
          </div>
        );
      
      case "admin":
        if ((!isAuthenticated && !isSignedIn) || userRole !== "admin") {
          setCurrentView("auth");
          router.push("/auth/signin");
          return null;
        }
        return (
          <AdminPanel 
            isAuthenticated={(isAuthenticated || isSignedIn) && userRole === "admin"}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
          />
        );
      
      case "landing":
      default:
        return (
          <LandingPage 
            onNavigate={handleNavigation}
            isAuthenticated={isAuthenticated || isSignedIn}
            userRole={userRole}
          />
        );
    }
  };

  return (
    <main className="min-h-screen">
      {/* Tracking pixel for analytics */}
      <TrackingPixel 
        debug={process.env.NODE_ENV === "development"}
        respectDoNotTrack={true}
        requireConsent={false}
      />
      
      {/* Main application content */}
      <div className="w-full">
        {renderCurrentView()}
      </div>
    </main>
  );
}