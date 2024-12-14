const mockNotificationService = {
  getUserNotifications: jest.fn().mockImplementation((userId, options = {}) => {
    const notifications = [
      {
        id: "1",
        type: "post_scheduled",
        message: "Post scheduled for publishing",
        read: false,
        createdAt: "2024-03-10T10:00:00Z",
      },
      {
        id: "2",
        type: "post_published",
        message: "Post published successfully",
        read: true,
        createdAt: "2024-03-09T15:00:00Z",
      },
    ];

    if (options.read !== undefined) {
      return Promise.resolve(
        notifications.filter((n) => n.read === options.read)
      );
    }
    return Promise.resolve(notifications);
  }),

  markNotificationAsRead: jest
    .fn()
    .mockImplementation(async (notificationId) => {
      if (notificationId === "non-existent-id") {
        const error = new Error("Notification not found");
        error.status = 404;
        throw error;
      }
      return {
        success: true,
        message: "Notification marked as read.",
      };
    }),

  deleteNotification: jest.fn().mockImplementation(async (notificationId) => {
    if (notificationId === "non-existent-id") {
      const error = new Error("Notification not found");
      error.status = 404;
      throw error;
    }
    return {
      success: true,
      message: "Notification deleted successfully",
    };
  }),

  updateNotificationSettings: jest
    .fn()
    .mockImplementation(async (userId, settings) => {
      if (!settings || typeof settings.reminderTime !== "number") {
        const error = new Error("Invalid settings");
        error.status = 400;
        throw error;
      }
      return {
        ...settings,
        userId,
      };
    }),

  getNotificationSettings: jest.fn().mockResolvedValue({
    prePostReminders: true,
    reminderTime: 30,
    emailNotifications: true,
    pushNotifications: false,
  }),

  sendTestNotification: jest
    .fn()
    .mockImplementation(async (type, destination) => {
      if (type === "invalid") {
        const error = new Error("Invalid notification type");
        error.status = 400;
        throw error;
      }
      return {
        success: true,
        message: "Test notification sent successfully",
      };
    }),
};

// Export mock service
module.exports = mockNotificationService;
