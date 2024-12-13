export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  prePostReminders: boolean;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  type?: "pre_post_reminder" | "post_published" | "post_failed" | "general";
}

export type NotificationType = Notification["type"];
