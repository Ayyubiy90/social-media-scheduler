// Mock Notification Service
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

    let filtered = [...notifications];

    if (options.read !== undefined) {
      filtered = filtered.filter((n) => n.read === options.read);
    }

    if (options.type) {
      filtered = filtered.filter((n) => n.type === options.type);
    }

    return Promise.resolve({
      success: true,
      notifications: filtered.slice(0, options.limit || 20),
    });
  }),

  markNotificationAsRead: jest
    .fn()
    .mockImplementation(async (notificationId) => {
      if (notificationId === "non-existent-id") {
        throw new Error("Notification not found");
      }
      return {
        success: true,
        result: {
          message: "Notification marked as read",
        },
      };
    }),

  deleteNotification: jest.fn().mockImplementation(async (notificationId) => {
    if (notificationId === "non-existent-id") {
      throw new Error("Notification not found");
    }
    return {
      success: true,
      result: {
        message: "Notification deleted successfully",
      },
    };
  }),

  updateNotificationSettings: jest
    .fn()
    .mockImplementation(async (userId, settings) => {
      if (typeof settings.reminderTime !== "number") {
        throw new Error("Invalid settings");
      }
      return {
        success: true,
        settings: {
          ...settings,
          userId,
        },
      };
    }),

  getNotificationSettings: jest.fn().mockResolvedValue({
    success: true,
    settings: {
      prePostReminders: true,
      reminderTime: 30,
      emailNotifications: true,
      pushNotifications: false,
    },
  }),

  sendTestNotification: jest
    .fn()
    .mockImplementation(async (type, destination) => {
      if (type === "invalid") {
        throw new Error("Invalid notification type");
      }
      return {
        success: true,
        result: {
          message: "Test notification sent successfully",
        },
      };
    }),

  updateFCMToken: jest.fn().mockImplementation(async (userId, fcmToken) => {
    if (!fcmToken) {
      throw new Error("FCM token is required");
    }
    return {
      success: true,
      result: {
        message: "FCM token updated successfully",
      },
    };
  }),

  schedulePrePostNotification: jest
    .fn()
    .mockImplementation(async (userId, postId, publishTime) => {
      if (!postId || !publishTime) {
        throw new Error("PostId and publishTime are required");
      }
      return {
        success: true,
        result: {
          message: "Pre-post notification scheduled successfully",
          jobId: "test-job-id",
          scheduledFor: publishTime,
        },
      };
    }),
};

// Mock the notification service module
jest.mock(
  "../../src/services/notificationService.cjs",
  () => mockNotificationService
);

module.exports = {
  mockNotificationService,
};
