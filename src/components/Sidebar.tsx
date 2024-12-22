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
  Loader2,
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { ProfileDialog } from "./ProfileDialog";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { Footer } from "./Footer";

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
  const { user, refreshUser } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { profilePicture, loading: loadingPicture } = useProfilePicture(
    user?.photoURL || null
  );

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

  const renderAvatar = () => {
    if (loadingPicture) {
      return (
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      );
    }

    if (profilePicture) {
      return (
        <div className="relative flex-shrink-0">
          <img
            className="h-12 w-12 rounded-full object-cover transition-transform duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500 shadow-lg"
            src={profilePicture}
            alt={`${user?.displayName || "User"}'s avatar`}
          />
          <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </div>
      );
    }

    return (
      <div
        className={`flex-shrink-0 h-12 w-12 rounded-full ${getProfileColor(
          user?.email
        )} flex items-center justify-center text-white text-lg font-semibold transition-transform duration-200 transform group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500 shadow-lg`}>
        {getInitial(user?.email)}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={() => setIsProfileOpen(true)}
        className="relative group cursor-pointer flex-shrink-0">
        {renderAvatar()}
      </div>

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={
          user || {
            uid: "",
            displayName: null,
            email: null,
            photoURL: null,
            token: "",
          }
        }
        onProfileUpdate={refreshUser}
      />
    </>
  );
}

export function Sidebar({ onClose }: SidebarProps) {
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const handleNotificationsClick = () => {
    // Navigate to notifications page on mobile
    if (window.innerWidth < 768) {
      navigate("/notifications");
      onClose();
    }
  };

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      icon: BarChart2,
      label: "Analytics",
      onClick: () => navigate("/analytics"),
      path: "/analytics",
    },
    {
      icon: Calendar,
      label: "Calendar",
      onClick: () => navigate("/calendar"),
      path: "/calendar",
    },
    {
      icon: FilePlus2,
      label: "Create Post",
      onClick: () => navigate("/create-post"),
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
      onClick: () => navigate("/settings"),
      path: "/settings",
    },
    {
      icon: Moon,
      label: "Theme",
      component: ThemeToggle,
    },
  ];

  const handleItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            aria-label="Close menu">
            <PanelRightClose className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-start space-x-4">
          <ProfileIcon />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
              {user?.displayName || "User"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2">
        <nav className="px-2 space-y-1">
          {navItems.map((item, index) => (
            <div key={index} className={item.className || "w-full"}>
              {item.component ? (
                <div className="flex items-center px-4 py-3.5 text-gray-700 dark:text-gray-300 rounded-lg">
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="flex-grow text-base">{item.label}</span>
                  <item.component />
                </div>
              ) : (
                <button
                  onClick={() => handleItemClick(item.onClick)}
                  className={`w-full flex items-center px-4 py-3.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    item.path && location.pathname === item.path
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 shadow-sm"
                      : ""
                  }`}>
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="flex-grow text-base">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800">
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
      <Footer />
    </div>
  );
}
