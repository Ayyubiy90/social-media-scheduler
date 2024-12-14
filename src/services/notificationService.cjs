const admin = require("firebase-admin");
const Queue = require("bull");

// Configure notification queue with Redis
let notificationQueue;
try {
  notificationQueue = new Queue("notificationQueue", {
    redis: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    settings: {
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      attempts: 3,
    },
  });

  notificationQueue.on('error', (error) => {
    console.error('Queue error:', error);
  });

  notificationQueue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed:`, error);
  });
} catch (error) {
  console.error('Failed to initialize notification queue:', error);
  // Continue without queue functionality
  notificationQueue = {
    add: async () => {
      console.warn('Queue not available, notification will be sent immediately');
      return null;
    },
    process: () => {},
  };
}

// Update or register FCM token
const updateFCMToken = async (userId, fcmToken) => {
  try {
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        fcmToken,
        fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return { success: true };
  } catch (error) {
    console.error("Error updating FCM token:", error);
    throw new Error("Failed to update FCM token");
  }
};

// Function to send notifications using Firebase Cloud Messaging
const sendNotification = async (userId, notification) => {
  try {
    const userRef = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    if (!userRef.exists) {
      throw new Error("User not found.");
    }
    const userData = userRef.data();

    // Get user's FCM token
    const fcmToken = userData.fcmToken;
    if (!fcmToken) {
      throw new Error("User has no FCM token registered.");
    }

    // Send push notification using FCM
    const message = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        postId: notification.postId || "",
        type: notification.type || "general",
        click_action: "OPEN_POST_DETAIL",
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);

    // Log notification
    await admin
      .firestore()
      .collection("notifications")
      .add({
        userId,
        ...notification,
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        fcmResponse: response,
      });

    return {
      success: true,
      message: "Notification sent.",
      messageId: response,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification.");
  }
};

// Schedule a reminder notification before post publishing
const schedulePrePostNotification = async (userId, postId, publishTime) => {
  try {
    const userSettings = await getNotificationSettings(userId);
    if (!userSettings.prePostReminders) {
      return {
        success: true,
        message: "Pre-post notifications disabled by user.",
      };
    }

    // Schedule notification 15 minutes before post time (or user's preferred time)
    const reminderTime = userSettings.reminderTime || 15; // minutes
    const notificationTime = new Date(publishTime - reminderTime * 60 * 1000);

    const notification = {
      userId,
      postId,
      type: "pre_post_reminder",
      title: "Upcoming Scheduled Post",
      message: `Your post is scheduled to be published in ${reminderTime} minutes.`,
      scheduledFor: notificationTime,
    };

    // Add to notification queue
    const job = await notificationQueue.add(notification, {
      delay: notificationTime.getTime() - Date.now(),
      attempts: 3,
      removeOnComplete: false,
    });

    // Store notification schedule in Firestore
    await admin
      .firestore()
      .collection("notifications")
      .doc(job.id)
      .set({
        ...notification,
        status: "scheduled",
        jobId: job.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message: "Pre-post notification scheduled.",
      jobId: job.id,
      scheduledFor: notificationTime,
    };
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw new Error("Failed to schedule notification.");
  }
};

// Process notification queue
notificationQueue.process(async (job) => {
  const { userId, title, message, postId, type } = job.data;
  return sendNotification(userId, { title, message, postId, type });
});

// Create notification settings with default values
const createNotificationSettings = async (userId, preferences = {}) => {
  try {
    const defaultSettings = {
      prePostReminders: true,
      reminderTime: 15, // minutes before post
      emailNotifications: true,
      pushNotifications: true,
      ...preferences,
    };

    const userRef = await admin.firestore().collection("users").doc(userId);
    await userRef.set(
      { notificationSettings: defaultSettings },
      { merge: true }
    );
    return {
      success: true,
      message: "Notification settings created successfully.",
      settings: defaultSettings,
    };
  } catch (error) {
    console.error("Error creating notification settings:", error);
    throw new Error("Failed to create notification settings.");
  }
};

// Get user's notification settings
const getNotificationSettings = async (userId) => {
  try {
    const userRef = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    if (!userRef.exists) {
      throw new Error("User not found.");
    }
    const userData = userRef.data();
    return userData.notificationSettings || {};
  } catch (error) {
    console.error("Error retrieving notification settings:", error);
    throw new Error("Failed to retrieve notification settings.");
  }
};

// Update notification settings
const updateNotificationSettings = async (userId, preferences) => {
  try {
    const userRef = await admin.firestore().collection("users").doc(userId);
    await userRef.update({ notificationSettings: preferences });
    return {
      success: true,
      message: "Notification settings updated successfully.",
      settings: preferences,
    };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw new Error("Failed to update notification settings.");
  }
};

// Get user's notifications
const getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 20, status, type } = options;
    let query = admin
      .firestore()
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (type) {
      query = query.where("type", "==", type);
    }

    const snapshot = await query.limit(limit).get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications.");
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  try {
    await admin
      .firestore()
      .collection("notifications")
      .doc(notificationId)
      .update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return { 
      success: true, 
      result: {
        message: "Notification marked as read"
      }
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read.");
  }
};

module.exports = {
  sendNotification,
  schedulePrePostNotification,
  createNotificationSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getUserNotifications,
  markNotificationAsRead,
  updateFCMToken,
  notificationQueue,
};

// This file has been moved to notificationService.cjs
// Please update any imports to use the new file name
