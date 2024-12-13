import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [setLocation]);

  // Handle body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Close sidebar when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex pt-16 relative">
        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>

        {/* Sidebar Overlay */}
        <div
          onClick={handleOverlayClick}
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
          {/* Sliding Sidebar */}
          <div
            className={`absolute top-0 right-0 h-full w-72 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}>
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
