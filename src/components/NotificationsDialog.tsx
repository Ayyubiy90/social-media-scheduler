import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { Bell } from "lucide-react";
import { Notification } from "../types/notification";

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDialog({
  isOpen,
  onClose,
}: NotificationsDialogProps) {
  const { notifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-auto md:right-4 md:w-96 z-50"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              <ul className="py-2">
                {notifications.map((notification: Notification) => (
                  <li
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}>
                    <div className="flex items-start">
                      <div className="ml-2">
                        <p className="text-sm text-gray-900 dark:text-white">
                          • {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
