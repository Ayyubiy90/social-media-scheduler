import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PanelRightOpen,
  PanelRightClose,
  CalendarCheck,
  LayoutDashboard,
  BarChart2,
  Calendar,
  FilePlus2,
  Settings,
  Bell,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useNotifications } from "../contexts/NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationsDialog } from "./NotificationsDialog";

interface TopNavProps {
  onSidebarToggle: () => void;
  isSidebarOpen?: boolean;
}

export function TopNav({ onSidebarToggle, isSidebarOpen }: TopNavProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const defaultAvatar = "https://via.placeholder.com/32";

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Menu button clicked");
    onSidebarToggle();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left section with logo */}
          <div className="flex items-center">
            <CalendarCheck className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-200" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              Social Media Scheduler
            </span>
          </div>

          {/* Center section with navigation buttons - only visible on desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <BarChart2 className="w-5 h-5" />
              Analytics
            </button>
            <button
              onClick={() => navigate("/calendar")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Calendar className="w-5 h-5" />
              Calendar
            </button>
            <button
              onClick={() => navigate("/create-post")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FilePlus2 className="w-5 h-5" />
              Create Post
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - visible on desktop */}
            <div className="hidden md:flex items-center">
              <ThemeToggle />
            </div>

            {/* Notification button - visible on desktop */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Avatar - only visible on desktop */}
            <div className="hidden md:block">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user?.photoURL || defaultAvatar}
                alt={`${user?.displayName || "User"}'s avatar`}
              />
            </div>

            {/* Menu button - only visible on mobile */}
            <button
              onClick={handleMenuClick}
              className="block md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Toggle navigation">
              {isSidebarOpen ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Notifications Dialog */}
      <NotificationsDialog
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}
