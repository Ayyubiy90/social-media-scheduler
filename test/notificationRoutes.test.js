const request = require('supertest');
const express = require('express');
const { mockNotificationService } = require('./setup/notification.mock');
require('./setup/firebase.mock');

// Mock Auth Middleware
jest.mock('../src/middleware/authMiddleware.cjs', () => ({
  verifyToken: (req, res, next) => {
    req.user = { uid: 'test-user-id' };
    next();
  },
  verifySession: (req, res, next) => next()
}));

const app = express();
const notificationRoutes = require('../notificationRoutes.cjs');

// Setup middleware and routes
app.use(express.json());
app.use('/notifications', notificationRoutes);

describe('Notification Routes', () => {
  let mockToken;
  
  beforeEach(() => {
    mockToken = 'mock-token-123';
    jest.clearAllMocks();
  });

  describe('GET /notifications', () => {
    it('should return user notifications', async () => {
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('message');
      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith('test-user-id', expect.any(Object));
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/notifications?read=false')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(notification => {
        expect(notification.read).toBe(false);
      });
    });
  });

  describe('PUT /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const response = await request(app)
        .put('/notifications/1/read')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockNotificationService.markNotificationAsRead).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/notifications/non-existent-id/read')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete notification', async () => {
      const response = await request(app)
        .delete('/notifications/1')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Notification deleted successfully');
      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .delete('/notifications/non-existent-id')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /notifications/settings', () => {
    const mockSettings = {
      prePostReminders: true,
      reminderTime: 30,
      emailNotifications: true,
      pushNotifications: false
    };

    it('should update notification settings', async () => {
      const response = await request(app)
        .put('/notifications/settings')
        .send(mockSettings)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.prePostReminders).toBe(mockSettings.prePostReminders);
      expect(response.body.reminderTime).toBe(mockSettings.reminderTime);
      expect(mockNotificationService.updateNotificationSettings).toHaveBeenCalledWith(
        'test-user-id',
        mockSettings
      );
    });

    it('should return 400 for invalid settings', async () => {
      const response = await request(app)
        .put('/notifications/settings')
        .send({
          reminderTime: 'invalid'
        })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /notifications/test', () => {
    it('should send test notification', async () => {
      const testData = {
        type: 'email',
        destination: 'test@example.com'
      };

      const response = await request(app)
        .post('/notifications/test')
        .send(testData)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Test notification sent successfully');
      expect(mockNotificationService.sendTestNotification).toHaveBeenCalledWith(
        testData.type,
        testData.destination
      );
    });

    it('should return 400 for invalid notification type', async () => {
      const response = await request(app)
        .post('/notifications/test')
        .send({
          type: 'invalid',
          destination: 'test@example.com'
        })
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /notifications/settings', () => {
    it('should return user notification settings', async () => {
      const response = await request(app)
        .get('/notifications/settings')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('prePostReminders');
      expect(response.body).toHaveProperty('reminderTime');
      expect(mockNotificationService.getNotificationSettings).toHaveBeenCalledWith('test-user-id');
    });
  });
});
