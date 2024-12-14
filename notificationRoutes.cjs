const express = require("express");
console.log("Notification routes initialized");
const router = express.Router();
const NotificationService = require("./src/services/notificationService.cjs");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");

// Get notification settings
router.get("/settings", verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const result = await NotificationService.getNotificationSettings(uid);
    res.json({ success: true, settings: result.settings });
  } catch (error) {
    console.error("Error getting notification settings:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update notification settings
router.put("/settings", verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const result = await NotificationService.updateNotificationSettings(
      uid,
      req.body
    );
    res.json({ success: true, settings: result.settings });
  } catch (error) {
    console.error("Error updating notification settings:", error.message);
    if (error.message === "Invalid settings") {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Get user notifications
router.get("/", verifyToken, verifySession, async (req, res) => {
  try {
    const { uid } = req.user;
    const { read, type, limit = 20 } = req.query;
    const result = await NotificationService.getUserNotifications(uid, {
      read: read === "true" ? true : read === "false" ? false : undefined,
      type,
      limit: parseInt(limit),
    });
    res.json({ success: true, notifications: result.notifications });
  } catch (error) {
    console.error("Error getting notifications:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.put("/:id/read", verifyToken, verifySession, async (req, res) => {
  try {
    const result = await NotificationService.markNotificationAsRead(
      req.params.id
    );
    res.json({ success: true, result: result.result });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    if (error.message === "Notification not found") {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Delete notification
router.delete("/:id", verifyToken, verifySession, async (req, res) => {
  try {
    const result = await NotificationService.deleteNotification(req.params.id);
    res.json({ success: true, result: result.result });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    if (error.message === "Notification not found") {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Schedule pre-post notification
router.post("/schedule/pre-post", verifyToken, verifySession, async (req, res) => {
  try {
    const { postId, publishTime } = req.body;
    const { uid } = req.user;

    if (!postId || !publishTime) {
      return res.status(400).json({
        success: false,
        error: "PostId and publishTime are required",
      });
    }

    const result = await NotificationService.schedulePrePostNotification(
      uid,
      postId,
      new Date(publishTime)
    );
    res.json({ success: true, result: result.result });
  } catch (error) {
    console.error("Error scheduling pre-post notification:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update FCM token
router.post("/token", verifyToken, verifySession, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const { uid } = req.user;
    
    if (!fcmToken) {
      return res.status(400).json({ success: false, error: "FCM token is required" });
    }

    const result = await NotificationService.updateFCMToken(uid, fcmToken);
    res.json({ success: true, result: result.result });
  } catch (error) {
    console.error("Error updating FCM token:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send test notification
router.post("/test", verifyToken, verifySession, async (req, res) => {
  try {
    const { type, destination } = req.body;
    if (!type || !destination) {
      return res.status(400).json({
        success: false,
        error: "Type and destination are required",
      });
    }
    const result = await NotificationService.sendTestNotification(
      type,
      destination
    );
    res.json({ success: true, result: result.result });
  } catch (error) {
    console.error("Error sending test notification:", error.message);
    if (error.message === "Invalid notification type") {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

module.exports = router;
