// Mock Notification Service
const mockNotificationService = {
  getUserNotifications: jest.fn().mockResolvedValue([
    {
      id: '1',
      type: 'post_scheduled',
      message: 'Post scheduled for publishing',
      read: false,
      createdAt: '2024-03-10T10:00:00Z'
    },
    {
      id: '2',
      type: 'post_published',
      message: 'Post published successfully',
      read: true,
      createdAt: '2024-03-09T15:00:00Z'
    }
  ]),
  markNotificationAsRead: jest.fn().mockImplementation(async (notificationId) => {
    if (notificationId === 'non-existent-id') {
      throw new Error('Notification not found');
    }
    return {
      success: true,
      message: "Notification marked as read."
    };
  }),
  deleteNotification: jest.fn().mockImplementation(async (notificationId) => {
    if (notificationId === 'non-existent-id') {
      throw new Error('Notification not found');
    }
    return {
      success: true,
      message: "Notification deleted successfully"
    };
  }),
  updateNotificationSettings: jest.fn().mockImplementation(async (userId, settings) => {
    if (typeof settings.reminderTime !== 'number') {
      throw new Error('Invalid settings');
    }
    return {
      ...settings,
      userId
    };
  }),
  getNotificationSettings: jest.fn().mockResolvedValue({
    prePostReminders: true,
    reminderTime: 30,
    emailNotifications: true,
    pushNotifications: false
  }),
  sendTestNotification: jest.fn().mockImplementation(async (type, destination) => {
    if (type === 'invalid') {
      throw new Error('Invalid notification type');
    }
    return {
      success: true,
      message: "Test notification sent successfully"
    };
  }),
  filterNotificationsByReadStatus: jest.fn().mockImplementation((notifications, read) => {
    return notifications.filter(n => n.read === read);
  })
};

// Mock the notification service module
jest.mock('../../src/services/notificationService.cjs', () => mockNotificationService);

module.exports = {
  mockNotificationService
};
