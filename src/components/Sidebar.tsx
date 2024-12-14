import React, { useState } from "react";
import {
  Bell,
  Settings,
  Moon,
  BarChart2,
  Calendar,
  FilePlus2,
  LayoutDashboard,
  PanelRightClose,
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { useLocation } from "wouter";
import { useUser } from "../contexts/UserContext";
import { ProfileDialog } from "./ProfileDialog";

interface NavItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  badge?: number;
  component?: React.ElementType;
  className?: string;
  path?: string;
}

interface SidebarProps {
  onClose: () => void;
}

function ProfileIcon() {
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      <div
        onClick={() => setIsProfileOpen(true)}
        className="relative group cursor-pointer">
        {user?.photoURL ? (
          <div className="relative">
            <img
              className="h-10 w-10 rounded-full object-cover transition-transform duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-500"
              src={user.photoURL}
              alt={`${user?.displayName || "User"}'s avatar`}
            />
            <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          </div>
        ) : (
          <div
            className={`h-10 w-10 rounded-full ${getProfileColor(
              user?.email
            )} flex items-center justify-center text-white text-sm font-semibold transition-transform duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-500`}>
            {getInitial(user?.email)}
          </div>
        )}
      </div>

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user || { uid: "", displayName: null, email: null, photoURL: null, token: "" }}
      />
    </>
  );
}

export function Sidebar({ onClose }: SidebarProps) {
  const { unreadCount } = useNotifications();
  const [location, setLocation] = useLocation();
  const { user } = useUser();

  const handleNotificationsClick = () => {
    // Navigate to notifications page on mobile
    if (window.innerWidth < 768) {
      setLocation("/notifications");
      onClose();
    }
  };

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      onClick: () => setLocation("/dashboard"),
      path: "/dashboard",
    },
    {
      icon: BarChart2,
      label: "Analytics",
      onClick: () => setLocation("/analytics"),
      path: "/analytics",
    },
    {
      icon: Calendar,
      label: "Calendar",
      onClick: () => setLocation("/calendar"),
      path: "/calendar",
    },
    {
      icon: FilePlus2,
      label: "Create Post",
      onClick: () => setLocation("/create-post"),
      path: "/create-post",
      className: "block md:hidden", // Show on mobile, hide on desktop
    },
    {
      icon: Bell,
      label: "Notifications",
      badge: unreadCount,
      onClick: handleNotificationsClick,
      path: "/notifications",
      className: "block md:hidden", // Show on mobile, hide on desktop
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => setLocation("/settings"),
      path: "/settings",
    },
    {
      icon: Moon,
      label: "Theme",
      component: ThemeToggle,
    },
  ];

  const handleItemClick = (onClick?: () => void) => {
    console.log("Item clicked");
    if (onClick) {
      onClick();
    }
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
      {/* Header with Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center space-x-3">
            <ProfileIcon />
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.displayName || "User"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 transition-colors"
            aria-label="Close menu">
            <PanelRightClose className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h3>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <nav className="px-2 py-4 space-y-1">
          {navItems.map((item, index) => (
            <div key={index} className={item.className || "w-full"}>
              {item.component ? (
                <div className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300">
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="flex-grow">{item.label}</span>
                  <item.component />
                </div>
              ) : (
                <button
                  onClick={() => handleItemClick(item.onClick)}
                  className={`w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${
                    item.path && location === item.path
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}>
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
