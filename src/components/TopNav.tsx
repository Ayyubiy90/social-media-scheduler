import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useNotifications } from "../contexts/NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationsDialog } from "./NotificationsDialog";
import { ProfileDialog } from "./ProfileDialog";
import { useProfilePicture } from "../hooks/useProfilePicture";

interface TopNavProps {
  onSidebarToggle: () => void;
  isSidebarOpen?: boolean;
}

export function TopNav({ onSidebarToggle, isSidebarOpen }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useUser();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { profilePicture, loading: loadingPicture } = useProfilePicture(user?.photoURL || null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/analytics",
      icon: BarChart2,
      label: "Analytics",
    },
    {
      path: "/calendar",
      icon: Calendar,
      label: "Calendar",
    },
    {
      path: "/create-post",
      icon: FilePlus2,
      label: "Create Post",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const renderAvatar = () => {
    if (loadingPicture) {
      return (
        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      );
    }

    if (profilePicture) {
      return (
        <div className="relative">
          <img
            className="h-10 w-10 rounded-lg object-cover transition-all duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500 shadow-sm"
            src={profilePicture}
            alt={`${user?.displayName || "User"}'s avatar`}
          />
          <div className="absolute inset-0 rounded-lg bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </div>
      );
    }

    return (
      <div
        className={`h-10 w-10 rounded-lg ${getProfileColor(
          user?.email
        )} flex items-center justify-center text-white text-sm font-semibold transition-all duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500 shadow-sm`}
      >
        {getInitial(user?.email)}
      </div>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left section with logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
              Social Media Scheduler
            </span>
          </div>

          {/* Center section with navigation buttons - only visible on desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 
                  text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    location.pathname === item.path
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle - visible on desktop */}
            <div className="hidden md:flex items-center">
              <ThemeToggle />
            </div>

            {/* Notification button - visible on desktop */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="hidden md:inline-flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
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
                {renderAvatar()}
              </div>
            </div>

            {/* Menu button - only visible on mobile */}
            <button
              onClick={handleMenuClick}
              className={`
                block md:hidden p-2 rounded-lg
                transition-all duration-200
                ${
                  isSidebarOpen
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
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
        onProfileUpdate={refreshUser}
      />
    </>
  );
}
