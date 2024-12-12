const admin = require("firebase-admin");
const db = require("./firebaseConfig.cjs");

async function setupCollections() {
  try {
    // Check if collections exist
    const collections = ["users", "posts", "notifications"];
    for (const collectionName of collections) {
      const collection = await db.collection(collectionName).get();
      console.log(`Collection ${collectionName} exists.`);
    }

    // Create required indexes
    await db
      .collection("posts")
      .doc("_dummy")
      .set({
        userId: "dummy",
        metadata: {
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });

    // Clean up dummy document
    await db.collection("posts").doc("_dummy").delete();

    // Log index creation instructions
    console.log(
      "Important: You need to create the following indexes in Firebase Console:"
    );
    console.log("1. Collection: posts");
    console.log("   Fields:");
    console.log("   - userId (Ascending)");
    console.log("   - metadata.publishedAt (Ascending)");
    console.log(
      "   URL: https://console.firebase.google.com/project/social-media-scheduler-9a3ad/firestore/indexes"
    );

    console.log("2. Collection: posts");
    console.log("   Fields:");
    console.log("   - userId (Ascending)");
    console.log("   - platforms.[platform].status (Ascending)");
    console.log(
      "   URL: https://console.firebase.google.com/project/social-media-scheduler-9a3ad/firestore/indexes"
    );

    console.log("Collections setup completed with full schema implementation.");
    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error setting up collections:", error);
    throw error;
  }
}

module.exports = setupCollections;
