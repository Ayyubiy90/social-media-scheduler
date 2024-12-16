import { getMessaging, getToken } from "firebase/messaging";
import { initializeApp, getApp } from "firebase/app";
import axiosInstance from "../config/axios";

const API_URL = import.meta.env.VITE_API_URL;
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

export interface NotificationSettings {
  prePostReminders: boolean;
  reminderTime: number; // minutes before post
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  postId?: string;
  type: "pre_post_reminder" | "post_published" | "post_failed" | "general";
  title: string;
  message: string;
  read: boolean;
  scheduledFor?: Date;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
}

export const notificationService = {
  // Get user's notification settings
  async getSettings(): Promise<NotificationSettings> {
    const response = await axiosInstance.get<{
      success: boolean;
      settings: NotificationSettings;
    }>(`${API_URL}/notifications/settings`);
    if (!response.data.success) {
      throw new Error("Failed to get notification settings");
    }
    return response.data.settings;
  },

  // Update notification settings
  async updateSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const response = await axiosInstance.put<{
      success: boolean;
      settings: NotificationSettings;
    }>(`${API_URL}/notifications/settings`, { preferences: settings });
    if (!response.data.success) {
      throw new Error("Failed to update notification settings");
    }
    return response.data.settings;
  },

  // Schedule a pre-post notification
  async schedulePrePostNotification(
    postId: string,
    publishTime: Date
  ): Promise<void> {
    const response = await axiosInstance.post<{ success: boolean }>(
      `${API_URL}/notifications/schedule/pre-post`,
      { postId, publishTime }
    );
    if (!response.data.success) {
      throw new Error("Failed to schedule notification");
    }
  },

  // Get user's notifications
  async getNotifications(
    options: {
      limit?: number;
      status?: string;
      type?: string;
    } = {}
  ): Promise<Notification[]> {
    const response = await axiosInstance.get<{
      success: boolean;
      notifications: Notification[];
    }>(`${API_URL}/notifications`, {
      params: options,
    });
    if (!response.data.success) {
      throw new Error("Failed to fetch notifications");
    }
    return response.data.notifications;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const response = await axiosInstance.put<{ success: boolean }>(
      `${API_URL}/notifications/${notificationId}/read`,
      {}
    );
    if (!response.data.success) {
      throw new Error("Failed to mark notification as read");
    }
  },

  // Request notification permission and save FCM token
  async requestNotificationPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Register service worker
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        // Initialize Firebase Messaging
        const messaging = getMessaging(app);
        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          // Save FCM token to backend
          const response = await axiosInstance.post<{ success: boolean }>(
            `${API_URL}/notifications/token`,
            { fcmToken: currentToken }
          );
          return response.data.success;
        }
        console.error("No FCM token available");
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  },

  // Test sending an immediate notification
  async sendTestNotification(title: string, message: string): Promise<void> {
    const response = await axiosInstance.post<{ success: boolean }>(
      `${API_URL}/notifications/send`,
      { title, message, type: "general" }
    );
    if (!response.data.success) {
      throw new Error("Failed to send test notification");
    }
  },
};
