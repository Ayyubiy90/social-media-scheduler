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
import { ProfileDialog } from "./ProfileDialog";

interface TopNavProps {
  onSidebarToggle: () => void;
  isSidebarOpen?: boolean;
}

export function TopNav({ onSidebarToggle, isSidebarOpen }: TopNavProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Menu button clicked");
    onSidebarToggle();
  };

  const getInitial = (email: string | null | undefined) => {
    return email ? email[0].toUpperCase() : "U";
  };

  const getProfileColor = (email: string | null | undefined) => {
    if (!email) return "bg-blue-500";
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
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
              <div 
                className="relative group cursor-pointer"
                onClick={() => setIsProfileOpen(true)}
              >
                {user?.photoURL ? (
                  <div className="relative">
                    <img
                      className="h-8 w-8 rounded-full object-cover transition-transform duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-500"
                      src={user.photoURL}
                      alt={`${user?.displayName || "User"}'s avatar`}
                    />
                    <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                  </div>
                ) : (
                  <div
                    className={`h-8 w-8 rounded-full ${getProfileColor(
                      user?.email
                    )} flex items-center justify-center text-white text-sm font-semibold transition-transform duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-500`}
                  >
                    {getInitial(user?.email)}
                  </div>
                )}
              </div>
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

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user || { uid: "", displayName: null, email: null, photoURL: null, token: "" }}
      />
    </>
  );
}
