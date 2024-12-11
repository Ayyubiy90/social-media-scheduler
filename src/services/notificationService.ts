import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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
    const token = localStorage.getItem("token");
    const response = await axios.get<NotificationSettings>(
      `${API_URL}/notifications/settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Update notification settings
  async updateSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const token = localStorage.getItem("token");
    const response = await axios.put<{ settings: NotificationSettings }>(
      `${API_URL}/notifications/settings`,
      { preferences: settings },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.settings;
  },

  // Schedule a pre-post notification
  async schedulePrePostNotification(
    postId: string,
    publishTime: Date
  ): Promise<void> {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/notifications/schedule/pre-post`,
      { postId, publishTime },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Get user's notifications
  async getNotifications(
    options: {
      limit?: number;
      status?: string;
      type?: string;
    } = {}
  ): Promise<Notification[]> {
    const token = localStorage.getItem("token");
    const response = await axios.get<Notification[]>(
      `${API_URL}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: options,
      }
    );
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Request notification permission and save FCM token
  async requestNotificationPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Here you would typically register the service worker and get FCM token
        // This is just a placeholder - you'll need to implement FCM registration
        console.log("Notification permission granted");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  },

  // Test sending an immediate notification
  async sendTestNotification(title: string, message: string): Promise<void> {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/notifications/send`,
      { title, message, type: "general" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
