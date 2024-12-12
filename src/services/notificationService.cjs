const db = require("../../firebaseConfig.cjs");

console.log("Notification Service initialized"); // Debugging statement
class NotificationService {
  static async getUserNotifications(userId, options = {}) {
    try {
      console.log(
        `Fetching notifications for user: ${userId} with options:`,
        options
      ); // Debugging statement
      const { read, type, limit = 20 } = options;
      let query = db.collection("notifications").where("userId", "==", userId);

      if (read !== undefined) {
        query = query.where("read", "==", read);
      }
      if (type) {
        query = query.where("type", "==", type);
      }

      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications.");
    }
  }

  static async markNotificationAsRead(notificationId) {
    try {
      console.log(`Marking notification as read: ${notificationId}`); // Debugging statement
      const notificationRef = db
        .collection("notifications")
        .doc(notificationId);
      const doc = await notificationRef.get();

      if (!doc.exists) {
        const error = new Error("Notification not found");
        error.status = 404;
        throw error;
      }

      await notificationRef.update({ read: true });
      return { success: true, message: "Notification marked as read." };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (error.status === 404) {
        throw error;
      }
      throw new Error("Failed to mark notification as read.");
    }
  }

  static async deleteNotification(notificationId) {
    try {
      console.log(`Deleting notification: ${notificationId}`); // Debugging statement
      const notificationRef = db
        .collection("notifications")
        .doc(notificationId);
      const doc = await notificationRef.get();

      if (!doc.exists) {
        const error = new Error("Notification not found");
        error.status = 404;
        throw error;
      }

      await notificationRef.delete();
      return { success: true, message: "Notification deleted successfully" };
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (error.status === 404) {
        throw error;
      }
      throw new Error("Failed to delete notification.");
    }
  }

  static async updateNotificationSettings(userId, settings) {
    try {
      console.log(
        `Updating notification settings for user: ${userId} with settings:`,
        settings
      ); // Debugging statement
      if (!settings || typeof settings.reminderTime !== "number") {
        const error = new Error("Invalid settings");
        error.status = 400;
        throw error;
      }

      const userRef = db.collection("users").doc(userId);
      await userRef.update({
        notificationSettings: settings,
      });

      return settings;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      if (error.status === 400) {
        throw error;
      }
      throw new Error("Failed to update notification settings.");
    }
  }

  static async getNotificationSettings(userId) {
    try {
      console.log(`Getting notification settings for user: ${userId}`); // Debugging statement
      const userRef = db.collection("users").doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        return {
          prePostReminders: true,
          reminderTime: 30,
          emailNotifications: true,
          pushNotifications: false,
        };
      }

      return (
        doc.data().notificationSettings || {
          prePostReminders: true,
          reminderTime: 30,
          emailNotifications: true,
          pushNotifications: false,
        }
      );
    } catch (error) {
      console.error("Error retrieving notification settings:", error);
      throw new Error("Failed to retrieve notification settings.");
    }
  }

  static async sendTestNotification(type, destination) {
    try {
      console.log(
        `Sending test notification of type: ${type} to destination: ${destination}`
      ); // Debugging statement
      if (!["email", "push", "sms"].includes(type)) {
        const error = new Error("Invalid notification type");
        error.status = 400;
        throw error;
      }

      // In a real implementation, this would send an actual notification
      return {
        success: true,
        message: "Test notification sent successfully",
      };
    } catch (error) {
      console.error("Error sending test notification:", error);
      if (error.status === 400) {
        throw error;
      }
      throw new Error("Failed to send test notification.");
    }
  }
}

module.exports = NotificationService;
