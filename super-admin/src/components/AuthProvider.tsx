"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    if (!token && pathname !== '/login') {
      window.location.href = '/login';
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname]);

  // Wait for auth check
  if (isAuthenticated === null && pathname !== '/login') {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#f4f7fb]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1877f2]"></div>
    </div>;
  }

  // If on login page, don't show the sidebar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4f7fb] text-gray-900 overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
