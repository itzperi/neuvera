"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TrackingDashboard from '@/components/tracking-dashboard';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if admin is authenticated
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    // Check if admin session is valid (24 hour expiry)
    const isSessionValid = adminLoginTime && 
      (Date.now() - parseInt(adminLoginTime)) < 24 * 60 * 60 * 1000;
    
    if (adminAuthenticated === 'true' && isSessionValid) {
      setIsAuthenticated(true);
    } else {
      // Clear invalid session
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminLoginTime');
      router.push('/admin/login');
    }
    
    setIsLoading(false);
  }, [router]);
  
  // Show loading state
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="h-screen flex flex-col">
      <TrackingDashboard />
    </div>
  );
}