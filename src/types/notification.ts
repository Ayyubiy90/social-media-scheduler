export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  prePostReminders: boolean;
  reminderTime: number; // minutes before post
}

export interface Notification {
  id: string;
  userId: string;
  postId?: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  sentAt?: Date;
  scheduledFor?: Date;
  type: "pre_post_reminder" | "post_published" | "post_failed" | "general";
  status?: "scheduled" | "sent" | "failed";
  fcmResponse?: string;
  jobId?: string;
}

export interface NotificationResponse<T> {
  success: boolean;
  error?: string;
  result?: T;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface NotificationSettingsResponse {
  success: boolean;
  settings: NotificationSettings;
}

export type NotificationType = Notification["type"];
