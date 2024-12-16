const admin = require("firebase-admin");

async function setupCollections(db) {
  try {
    // Check if collections exist
    const collections = ["users", "posts", "notifications"];
    for (const collectionName of collections) {
      try {
        const collection = await db.collection(collectionName).limit(1).get();
        console.log(`Collection ${collectionName} exists.`);
      } catch (error) {
        console.log(`Creating collection ${collectionName}...`);
        // Collection will be created automatically when first document is added
      }
    }

    try {
      // Create required indexes by creating and deleting dummy documents
      // Posts index
      await db
        .collection("posts")
        .doc("_dummy")
        .set({
          userId: "dummy",
          metadata: {
            publishedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        });

      // Notifications index
      await db.collection("notifications").doc("_dummy").set({
        userId: "dummy",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Clean up dummy documents
      await db.collection("posts").doc("_dummy").delete();
      await db.collection("notifications").doc("_dummy").delete();
    } catch (error) {
      console.warn("Warning: Could not create dummy documents:", error.message);
    }

    // Log index creation instructions
    console.log(
      "\nImportant: You need to create the following indexes in Firebase Console:"
    );
    console.log("1. Collection: posts");
    console.log("   Fields:");
    console.log("   - userId (Ascending)");
    console.log("   - metadata.publishedAt (Ascending)");

    console.log("\n2. Collection: posts");
    console.log("   Fields:");
    console.log("   - userId (Ascending)");
    console.log("   - platforms.[platform].status (Ascending)");

    console.log("\n3. Collection: notifications");
    console.log("   Fields:");
    console.log("   - userId (Ascending)");
    console.log("   - createdAt (Descending)");
    console.log("   - __name__ (Ascending)");

    console.log("\nFirebase Console URL:");
    console.log(
      "https://console.firebase.google.com/project/social-media-scheduler-9a3ad/firestore/indexes"
    );

    console.log("\nCollections setup completed successfully.");
    return true;
  } catch (error) {
    console.error("Error setting up collections:", error);
    throw error;
  }
}

module.exports = setupCollections;
