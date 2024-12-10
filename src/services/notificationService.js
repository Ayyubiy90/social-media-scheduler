const admin = require("firebase-admin");

// Function to send notifications
const sendNotification = async (userId, message) => {
  // Logic to send notification (e.g., using Firebase Cloud Messaging)
  try {
    const userRef = await admin.firestore().collection("users").doc(userId).get();
    if (!userRef.exists) {
      throw new Error("User not found.");
    }
    const userData = userRef.data();
    
    // Here you would implement the logic to send the notification
    // For example, using Firebase Cloud Messaging to send a push notification
    console.log(`Sending notification to ${userData.email}: ${message}`);
    
    // Return success response
    return { success: true, message: "Notification sent." };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification.");
  }
};

// Function to schedule notifications
const scheduleNotification = async (userId, postId, scheduledTime) => {
  // Logic to schedule a notification (e.g., using a job queue)
  // This could involve creating a job that triggers the sendNotification function at the scheduled time
  console.log(`Scheduling notification for user ${userId} for post ${postId} at ${scheduledTime}`);
  
  // Return success response
  return { success: true, message: "Notification scheduled." };
};

// Function to create notification settings
const createNotificationSettings = async (userId, preferences) => {
  try {
    const userRef = await admin.firestore().collection("users").doc(userId);
    await userRef.set({ notificationSettings: preferences }, { merge: true });
    return { success: true, message: "Notification settings created successfully." };
  } catch (error) {
    console.error("Error creating notification settings:", error);
    throw new Error("Failed to create notification settings.");
  }
};

// Function to retrieve notification settings
const getNotificationSettings = async (userId) => {
  try {
    const userRef = await admin.firestore().collection("users").doc(userId).get();
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

// Function to update notification settings
const updateNotificationSettings = async (userId, preferences) => {
  try {
    const userRef = await admin.firestore().collection("users").doc(userId);
    await userRef.update({ notificationSettings: preferences });
    return { success: true, message: "Notification settings updated successfully." };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw new Error("Failed to update notification settings.");
  }
};

// Function to delete notification settings
const deleteNotificationSettings = async (userId) => {
  try {
    const userRef = await admin.firestore().collection("users").doc(userId);
    await userRef.update({ notificationSettings: admin.firestore.FieldValue.delete() });
    return { success: true, message: "Notification settings deleted successfully." };
  } catch (error) {
    console.error("Error deleting notification settings:", error);
    throw new Error("Failed to delete notification settings.");
  }
};

module.exports = {
  sendNotification,
  scheduleNotification,
  createNotificationSettings,
  getNotificationSettings,
  updateNotificationSettings,
  deleteNotificationSettings,
};
