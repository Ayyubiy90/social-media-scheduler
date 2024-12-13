import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [setLocation]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMobile={isMobile}
      />
      
      <div className="flex pt-16">
        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden transition-opacity duration-300 ease-in-out"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 lg:z-0 top-0 w-64 sm:w-72 lg:w-64
          ${isSidebarOpen ? 'shadow-xl' : ''}`}
        >
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <Sidebar 
              onClose={() => setIsSidebarOpen(false)} 
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
