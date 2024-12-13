import React from 'react';
import { Menu, CalendarCheck } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface TopNavProps {
  onSidebarToggle: () => void;
}

export function TopNav({ onSidebarToggle }: TopNavProps) {
  const { user } = useUser();
  const defaultAvatar = "https://via.placeholder.com/32";

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Menu button clicked');
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

        {/* Right section with avatar and menu button */}
        <div className="flex items-center space-x-4">
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={user?.photoURL || defaultAvatar}
            alt={`${user?.displayName || 'User'}'s avatar`}
          />
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label="Toggle navigation"
          >
            <Menu className="h-6 w-6 text-gray-500 dark:text-gray-200" />
          </button>
        </div>
      </div>
    </nav>
  );
}
