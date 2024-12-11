const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");
const {
  sendNotification,
  schedulePrePostNotification,
  createNotificationSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getUserNotifications,
  markNotificationAsRead,
} = require("./src/services/notificationService.cjs");

// Get user's notification settings
router.get("/settings", verifyToken, verifySession, async (req, res) => {
  try {
    const settings = await getNotificationSettings(req.user.uid);
    res.json(settings);
  } catch (error) {
    console.error("Error getting notification settings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create/Update notification settings
router.post("/settings", verifyToken, verifySession, async (req, res) => {
  try {
    const { preferences } = req.body;
    const settings = await createNotificationSettings(
      req.user.uid,
      preferences
    );
    res.json(settings);
  } catch (error) {
    console.error("Error creating notification settings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update notification settings
router.put("/settings", verifyToken, verifySession, async (req, res) => {
  try {
    const { preferences } = req.body;
    const settings = await updateNotificationSettings(
      req.user.uid,
      preferences
    );
    res.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's notifications with filtering and pagination
router.get("/", verifyToken, verifySession, async (req, res) => {
  try {
    const { limit, status, type } = req.query;
    const notifications = await getUserNotifications(req.user.uid, {
      limit: parseInt(limit) || 20,
      status,
      type,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule a pre-post notification
router.post(
  "/schedule/pre-post",
  verifyToken,
  verifySession,
  async (req, res) => {
    try {
      const { postId, publishTime } = req.body;
      const notification = await schedulePrePostNotification(
        req.user.uid,
        postId,
        new Date(publishTime)
      );
      res.json(notification);
    } catch (error) {
      console.error("Error scheduling pre-post notification:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Mark notification as read
router.put(
  "/:notificationId/read",
  verifyToken,
  verifySession,
  async (req, res) => {
    try {
      const { notificationId } = req.params;
      const result = await markNotificationAsRead(notificationId);
      res.json(result);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Send immediate notification (for testing)
router.post("/send", verifyToken, verifySession, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const result = await sendNotification(req.user.uid, {
      title,
      message,
      type,
    });
    res.json(result);
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
