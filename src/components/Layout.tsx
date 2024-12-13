import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Debug log for sidebar state
  useEffect(() => {
    console.log('Sidebar state:', isSidebarOpen);
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [setLocation]);

  // Handle body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav onSidebarToggle={() => {
        console.log('Toggle clicked, current state:', isSidebarOpen);
        setIsSidebarOpen(!isSidebarOpen);
      }} />
      
      <div className="flex pt-16 relative">
        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>

        {/* Fixed Overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isSidebarOpen 
              ? 'bg-opacity-50 z-40' 
              : 'bg-opacity-0 pointer-events-none -z-10'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Fixed Sidebar */}
        <div 
          className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-out z-50 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ 
            boxShadow: isSidebarOpen ? '-4px 0 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            marginTop: '64px' // height of TopNav
          }}
        >
          <Sidebar onClose={() => {
            console.log('Sidebar close clicked');
            setIsSidebarOpen(false);
          }} />
        </div>
      </div>
    </div>
  );
}
