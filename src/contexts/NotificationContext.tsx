import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import {
  notificationService,
  Notification,
  NotificationSettings,
} from "../services/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  schedulePrePostNotification: (
    postId: string,
    publishTime: Date
  ) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const fetchedNotifications = await notificationService.getNotifications();
      setNotifications(fetchedNotifications);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const fetchSettings = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const settings = await notificationService.getSettings();
      setSettings(settings);
    } catch (err) {
      console.error("Failed to fetch notification settings:", err);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      fetchSettings();
    }
  }, [user?.uid, fetchNotifications, fetchSettings]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = await notificationService.updateSettings(
        newSettings
      );
      setSettings(updatedSettings);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update notification settings"
      );
      throw err;
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      if (granted && settings) {
        await updateSettings({ ...settings, pushNotifications: true });
      }
      return granted;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to request notification permission"
      );
      return false;
    }
  };

  const schedulePrePostNotification = async (
    postId: string,
    publishTime: Date
  ) => {
    try {
      await notificationService.schedulePrePostNotification(
        postId,
        publishTime
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule pre-post notification"
      );
      throw err;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        updateSettings,
        requestPermission,
        schedulePrePostNotification,
      }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
