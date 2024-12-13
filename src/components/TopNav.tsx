import React from "react";
import { PanelRightOpen, PanelRightClose, CalendarCheck } from "lucide-react";
import { useUser } from "../contexts/UserContext";

interface TopNavProps {
  onSidebarToggle: () => void;
  isSidebarOpen?: boolean;
}

export function TopNav({ onSidebarToggle, isSidebarOpen }: TopNavProps) {
  const { user } = useUser();
  const defaultAvatar = "https://via.placeholder.com/32";

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Menu button clicked");
    onSidebarToggle();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left section with logo */}
        <div className="flex items-center">
          <CalendarCheck className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-200" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            Social Media Scheduler
          </span>
        </div>

        {/* Right section with menu button */}
        <div className="flex items-center">
          {/* Avatar - only visible on desktop */}
          <div className="hidden md:block">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user?.photoURL || defaultAvatar}
              alt={`${user?.displayName || "User"}'s avatar`}
            />
          </div>
          {/* Menu button - always visible */}
          <button
            onClick={handleMenuClick}
            className="fixed right-6 top-4 z-50 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-xl border border-gray-200 dark:border-gray-600"
            aria-label="Toggle navigation">
            {isSidebarOpen ? (
              <PanelRightClose className="w-8 h-8" />
            ) : (
              <PanelRightOpen className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
