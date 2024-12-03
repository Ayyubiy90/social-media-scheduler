import React from "react";
import { Home, Calendar, PieChart, Settings, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  const getLinkClassName = (path: string) => `
    group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer
    ${
      location === path
        ? "text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
    }
  `;

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/create", icon: Plus, label: "Create Post" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/analytics", icon: PieChart, label: "Analytics" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="flex justify-between items-center lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xl font-semibold text-gray-900 dark:text-white">
          Menu
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <span className="sr-only">Close menu</span>×
        </button>
      </div>
      <nav className="mt-0 px-2 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <div key={path} onClick={onClose}>
            <Link href={path}>
              <div className={getLinkClassName(path)}>
                <Icon className="mr-3 h-6 w-6" />
                {label}
              </div>
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}
