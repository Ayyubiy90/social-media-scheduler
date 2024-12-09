const admin = require("firebase-admin");
const db = require("./firebaseConfig.cjs");

async function setupCollections() {
  const collections = ["users", "posts", "notifications"];

  // Ensure collections exist
  for (const collection of collections) {
    try {
      await db.collection(collection).get();
      console.log(`Collection ${collection} exists.`);
    } catch (error) {
      console.log(`Creating collection ${collection}...`);
    }
  }

  try {
    // Users Collection - Complete Schema
    await db
      .collection("users")
      .doc("exampleUser")
      .set({
        email: "example@example.com",
        displayName: "Example User",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Social Media Accounts
        connectedAccounts: {
          google: {
            id: null,
            accessToken: null,
            refreshToken: null,
            connected: false,
          },
          facebook: {
            id: null,
            accessToken: null,
            refreshToken: null,
            connected: false,
          },
          twitter: {
            id: null,
            accessToken: null,
            tokenSecret: null,
            connected: false,
          },
          linkedin: {
            id: null,
            accessToken: null,
            refreshToken: null,
            connected: false,
          },
        },
        // User Preferences
        preferences: {
          theme: "light",
          emailNotifications: true,
          pushNotifications: true,
          defaultPlatforms: [], // Default platforms for posting
          timezone: "UTC",
          language: "en",
          autoScheduling: false,
        },
      });

    // Posts Collection - Complete Schema
    await db
      .collection("posts")
      .doc("examplePost")
      .set({
        userId: "exampleUser",
        content: {
          text: "This is an example post.",
          media: [], // Array of media URLs
          links: [], // Array of links
        },
        platforms: {
          facebook: { enabled: false, status: null },
          twitter: { enabled: false, status: null },
          linkedin: { enabled: false, status: null },
        },
        schedule: {
          isScheduled: false,
          scheduledTime: null,
          timezone: "UTC",
        },
        status: "draft", // draft, scheduled, published, failed
        analytics: {
          likes: 0,
          shares: 0,
          comments: 0,
          reach: 0,
        },
        metadata: {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          publishedAt: null,
        },
      });

    // Notifications Collection - Complete Schema
    await db
      .collection("notifications")
      .doc("exampleNotification")
      .set({
        userId: "exampleUser",
        postId: "examplePost", // Reference to associated post
        type: "schedule", // schedule, publish, error, etc.
        status: "pending", // pending, sent, failed
        schedule: {
          scheduledTime: admin.firestore.Timestamp.fromDate(new Date()),
          timezone: "UTC",
        },
        content: {
          title: "Scheduled Post Reminder",
          message: "Your post is scheduled to be published soon.",
          data: {}, // Additional notification data
        },
        metadata: {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          sentAt: null,
        },
      });

    console.log("Collections setup completed with full schema implementation.");
  } catch (error) {
    console.error("Error setting up collections:", error);
    throw error;
  }
}

// Create indexes for common queries
async function setupIndexes() {
  try {
    // Index for posts by userId and status
    await db.collection("posts").doc("__dummy__").set({});
    await db
      .collection("posts")
      .where("userId", "==", "")
      .where("status", "==", "")
      .get();

    // Index for notifications by userId and status
    await db.collection("notifications").doc("__dummy__").set({});
    await db
      .collection("notifications")
      .where("userId", "==", "")
      .where("status", "==", "")
      .get();

    console.log("Indexes setup completed.");
  } catch (error) {
    console.error("Error setting up indexes:", error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    await setupCollections();
    await setupIndexes();
    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
