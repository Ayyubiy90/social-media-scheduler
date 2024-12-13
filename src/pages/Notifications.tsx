import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { Layout } from "../components/Layout";
import { Bell } from "lucide-react";

export function NotificationsPage() {
  const { notifications } = useNotifications();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 md:hidden">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h1>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}>
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            • {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default NotificationsPage;
