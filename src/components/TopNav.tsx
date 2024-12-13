import React from 'react';
import { Menu, Bell, Settings, CalendarCheck } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { ThemeToggle } from './ThemeToggle';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useUser();
  const { unreadCount } = useNotifications();

  const defaultAvatar = "https://via.placeholder.com/32";

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section with menu and title */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="inline-flex md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-500 dark:text-gray-200" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <CalendarCheck className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-200" />
              <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                Social Media Scheduler
              </span>
            </div>
          </div>

          {/* Right section with actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop-only navigation items */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6 text-gray-500 dark:text-gray-200" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Settings"
              >
                <Settings className="h-6 w-6 text-gray-500 dark:text-gray-200" />
              </button>
            </div>

            {/* Always visible user avatar */}
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user?.photoURL || defaultAvatar}
              alt={`${user?.displayName || 'User'}'s avatar`}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
