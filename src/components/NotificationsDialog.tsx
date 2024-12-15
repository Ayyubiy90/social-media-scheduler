import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { Bell, X, BellOff, CheckCircle, Clock } from "lucide-react";
import { Notification } from "../types/notification";

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDialog({
  isOpen,
  onClose,
}: NotificationsDialogProps) {
  const { notifications, markAsRead } = useNotifications();

  if (!isOpen) return null;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const formatTimeAgo = (date: string | number) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-25 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-auto md:right-4 md:w-96 z-50"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-200">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl px-6 flex items-center">
            <div className="absolute -bottom-6 left-6">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-20">
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
              <p className="text-blue-100 text-sm mt-1">
                Stay updated with your latest activities
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="mt-8 max-h-[calc(100vh-250px)] overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      px-6 py-4 cursor-pointer
                      transition-all duration-200
                      hover:bg-gray-50 dark:hover:bg-gray-700
                      ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }
                    `}>
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                        mt-1 p-2 rounded-lg
                        ${
                          notification.read
                            ? "bg-gray-100 dark:bg-gray-700"
                            : "bg-blue-100 dark:bg-blue-900/50"
                        }
                      `}>
                        {notification.read ? (
                          <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`
                          text-sm
                          ${
                            notification.read
                              ? "text-gray-600 dark:text-gray-300"
                              : "text-gray-900 dark:text-white font-medium"
                          }
                        `}>
                          {notification.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notification.createdAt.toString())}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No notifications yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <button
                onClick={() =>
                  notifications.forEach((n) => !n.read && markAsRead(n.id))
                }
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
