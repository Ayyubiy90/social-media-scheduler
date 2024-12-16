const admin = require("firebase-admin");
const serviceAccount = require("./backend/admin/serviceAccountKey.json");

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 5000]; // Delays in milliseconds
const MAX_RETRIES = 3;

// Sleep function for retry delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize Firebase with enhanced retry logic
const initializeFirebase = async () => {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Only initialize if not already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "https://social-media-scheduler-9a3ad.firebaseio.com",
        });
      }

      const db = admin.firestore();

      // Test the connection with a timeout
      const connectionTest = Promise.race([
        db.listCollections(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 10000)
        ),
      ]);

      await connectionTest;

      console.log("Firebase connection established successfully");
      return db;
    } catch (error) {
      lastError = error;
      console.error(
        `Attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
        error.message
      );

      if (error.code === 14 || error.code === "ETIMEDOUT") {
        console.log("Connection timeout. Checking network connectivity...");

        // If this isn't the last attempt, wait before retrying
        if (attempt < MAX_RETRIES - 1) {
          const delay = RETRY_DELAYS[attempt];
          console.log(`Retrying in ${delay / 1000} seconds...`);
          await sleep(delay);
          continue;
        }
      }

      // If error is not timeout-related or it's the last attempt, break the retry loop
      break;
    }
  }

  // If we get here, all retries failed
  console.error("Failed to initialize Firebase after multiple attempts");
  console.error("Please check:");
  console.error("1. Your internet connection");
  console.error("2. Firewall settings");
  console.error("3. VPN settings (if applicable)");
  console.error("4. Firebase console for service status");
  throw lastError;
};

// Export a promise that resolves to the initialized Firestore instance
module.exports = initializeFirebase();
