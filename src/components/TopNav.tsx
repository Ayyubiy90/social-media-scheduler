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
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between relative">
          {/* Left section with logo */}
          <div className="flex items-center">
            <CalendarCheck className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-200" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              Social Media Scheduler
            </span>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            {/* Avatar - only visible on desktop */}
            <div className="hidden md:block">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user?.photoURL || defaultAvatar}
                alt={`${user?.displayName || "User"}'s avatar`}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Fixed Menu Button - Always visible */}
      <button
        onClick={handleMenuClick}
        className="fixed right-4 top-4 z-[999] p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-w-[44px] min-h-[44px]"
        style={{
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
        }}
        aria-label="Toggle navigation"
      >
        {isSidebarOpen ? (
          <PanelRightClose className="w-8 h-8" />
        ) : (
          <PanelRightOpen className="w-8 h-8" />
        )}
      </button>
    </>
  );
}
