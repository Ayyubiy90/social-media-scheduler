import React from 'react';
import { Menu, X, Bell, Settings, CalendarCheck } from 'lucide-react'; // Importing the CalendarCheck icon
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { ThemeToggle } from './ThemeToggle';

interface TopNavProps {
  onMenuClick: () => void;
  isMenuOpen: boolean; // New prop to track menu state
  onCloseMenu: () => void; // New prop to close the menu
}

export function TopNav({ onMenuClick, isMenuOpen, onCloseMenu }: TopNavProps) {
  const { user } = useUser();
  const { showNotification } = useNotifications();

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              <Menu className="h-6 w-6 text-gray-500 dark:text-gray-200" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <CalendarCheck className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-200" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Social Media Scheduler
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => showNotification('No new notifications', 'info')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Bell className="h-6 w-6 text-gray-500 dark:text-gray-200" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
              <Settings className="h-6 w-6 text-gray-500 dark:text-gray-200" />
            </button>
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar}
              alt={`${user.name}'s avatar`}
            />
          </div>
        </div>
        {isMenuOpen && ( // Conditional rendering for mobile menu
          <div className="lg:hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={onCloseMenu}>
                <X className="h-6 w-6 text-gray-500 dark:text-gray-200" />
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              {/* Add your mobile menu items here */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
