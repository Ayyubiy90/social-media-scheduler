import React from "react";
import { Bell, Settings, ThumbsUp, BarChart2, Calendar, FilePlus2, LogOut } from "lucide-react";
import { useNotifications } from '../contexts/NotificationContext';
import { ThemeToggle } from './ThemeToggle';
import { useLocation } from 'wouter';
import { useUser } from '../contexts/UserContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  badge?: number;
  component?: React.ElementType;
  className?: string;
}

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { unreadCount } = useNotifications();
  const [, setLocation] = useLocation();
  const { logout } = useUser();

  const navItems: NavItem[] = [
    {
      icon: BarChart2,
      label: "Analytics",
      onClick: () => setLocation("/analytics"),
    },
    {
      icon: Calendar,
      label: "Calendar",
      onClick: () => setLocation("/calendar"),
    },
    {
      icon: FilePlus2,
      label: "Create Post",
      onClick: () => setLocation("/create-post"),
      className: "block md:hidden", // Show on mobile, hide on desktop
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => setLocation("/settings"),
    },
    {
      icon: Bell,
      label: "Notifications",
      badge: unreadCount,
      onClick: () => console.log("Notifications clicked"),
    },
    {
      icon: ThumbsUp,
      label: "Theme",
      component: ThemeToggle,
    },
    {
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        logout();
        setLocation("/login");
      },
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg overflow-hidden mt-16">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Menu
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
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
                  className={`w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${item.className || ''}`}
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2024 Social Media Scheduler
        </p>
      </div>
    </div>
  );
}
