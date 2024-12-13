const express = require('express');
console.log("Notification routes initialized");
const router = express.Router();
const NotificationService = require('./src/services/notificationService.cjs');
const { verifyToken, verifySession } = require('./src/middleware/authMiddleware.cjs');

// Get notification settings
router.get('/settings', verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const settings = await NotificationService.getNotificationSettings(uid);
    res.json(settings);
  } catch (error) {
    console.error("Error getting notification settings:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update notification settings
router.put('/settings', verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const settings = await NotificationService.updateNotificationSettings(uid, req.body);
    res.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error.message);
    if (error.message === 'Invalid settings') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get user notifications
router.get('/', verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const { read, type, limit = 20 } = req.query;
    let notifications = await NotificationService.getUserNotifications(uid, { read: read === 'true' ? true : read === 'false' ? false : undefined, type, limit: parseInt(limit) });
    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', verifyToken, verifySession, async (req, res) => {
  try {
    const result = await NotificationService.markNotificationAsRead(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete notification
router.delete('/:id', verifyToken, verifySession, async (req, res) => {
  try {
    const result = await NotificationService.deleteNotification(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Send test notification
router.post('/test', verifyToken, verifySession, async (req, res) => {
  try {
    const { type, destination } = req.body;
    if (!type || !destination) {
      return res.status(400).json({ error: 'Type and destination are required' });
    }
    const result = await NotificationService.sendTestNotification(type, destination);
    res.json(result);
  } catch (error) {
    console.error("Error sending test notification:", error.message);
    if (error.message === 'Invalid notification type') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
