import React from "react";
import { Bell, Settings, ThumbsUp, X } from "lucide-react";
import { useNotifications } from '../contexts/NotificationContext';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { unreadCount } = useNotifications();

  const navItems = [
    {
      icon: Bell,
      label: "Notifications",
      badge: unreadCount,
      onClick: () => console.log("Notifications clicked"),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => console.log("Settings clicked"),
    },
    {
      icon: ThumbsUp,
      label: "Theme",
      component: ThemeToggle,
    },
  ];

  const handleItemClick = (onClick?: () => void) => {
    console.log('Item clicked');
    if (onClick) {
      onClick();
    }
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg">
      {/* Header */}
      <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Menu
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Close button clicked');
            onClose();
          }}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-2">
          {navItems.map((item, index) => (
            <div key={index} className="w-full">
              {item.component ? (
                <div className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300">
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="flex-grow">{item.label}</span>
                  <item.component />
                </div>
              ) : (
                <button
                  onClick={() => handleItemClick(item.onClick)}
                  className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="flex-grow">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2024 Social Media Scheduler
        </p>
      </div>
    </div>
  );
}
