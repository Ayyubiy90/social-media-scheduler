import React from "react";
import { Home, Calendar, PieChart, Settings, Plus, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useNotifications } from "../contexts/NotificationContext";
import { LucideIcon } from "lucide-react";

interface SidebarProps {
  onClose: () => void;
  isMobile: boolean;
}

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export function Sidebar({ onClose, isMobile }: SidebarProps) {
  const [location] = useLocation();
  const { unreadCount } = useNotifications();

  const getLinkClassName = (path: string) => `
    group flex items-center px-3 py-3 text-sm md:text-base font-medium rounded-md cursor-pointer
    w-full transition-all duration-200 ease-in-out
    ${
      location === path
        ? "text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-700 shadow-sm"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
    }
  `;

  const getIconClassName =
    "flex-shrink-0 w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110";

  const navItems: NavItem[] = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/create", icon: Plus, label: "Create Post" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/analytics", icon: PieChart, label: "Analytics" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  // Only show notifications in mobile sidebar
  const mobileOnlyItems: NavItem[] = isMobile
    ? [
        {
          path: "/notifications",
          icon: Bell,
          label: "Notifications",
          badge: unreadCount,
        },
      ]
    : [];

  const allItems = [...navItems, ...mobileOnlyItems];

  return (
    <aside className="mt-0 w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="flex justify-between items-center lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          Menu
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="sr-only">Close menu</span>×
        </button>
      </div>
      <nav className="p-3 md:p-4 space-y-2 md:space-y-3">
        {allItems.map(({ path, icon: Icon, label, badge }) => (
          <div
            key={path}
            onClick={onClose}
            className="w-full transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Link href={path}>
              <div className={getLinkClassName(path)}>
                <Icon className={`${getIconClassName} mr-3`} />
                <span className="truncate flex-grow">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}
