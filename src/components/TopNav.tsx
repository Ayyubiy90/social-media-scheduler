import React from 'react';
import { Menu, CalendarCheck } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface TopNavProps {
  onSidebarToggle: () => void;
}

export function TopNav({ onSidebarToggle }: TopNavProps) {
  const { user } = useUser();
  const defaultAvatar = "https://via.placeholder.com/32";

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
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
              onClick={onSidebarToggle}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200"
              aria-label="Toggle navigation"
            >
              <Menu className="h-6 w-6 text-gray-500 dark:text-gray-200" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
