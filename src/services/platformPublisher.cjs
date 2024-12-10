const admin = require("firebase-admin");
const db = require("../../firebaseConfig.cjs");

class PlatformPublisher {
  static async publishToFacebook(content, accessToken) {
    try {
      // Simulate Facebook API call
      console.log("Publishing to Facebook:", content);
      return { success: true, postId: "fb_" + Date.now() };
    } catch (error) {
      console.error("Facebook publish error:", error);
      throw error;
    }
  }

  static async publishToTwitter(content, accessToken, tokenSecret) {
    try {
      // Simulate Twitter API call
      console.log("Publishing to Twitter:", content);
      return { success: true, postId: "tw_" + Date.now() };
    } catch (error) {
      console.error("Twitter publish error:", error);
      throw error;
    }
  }

  static async publishToLinkedIn(content, accessToken) {
    try {
      // Simulate LinkedIn API call
      console.log("Publishing to LinkedIn:", content);
      return { success: true, postId: "li_" + Date.now() };
    } catch (error) {
      console.error("LinkedIn publish error:", error);
      throw error;
    }
  }

  static async updatePostStatus(
    postId,
    platform,
    status,
    platformPostId = null
  ) {
    try {
      const updateData = {
        [`platforms.${platform}.status`]: status,
        "metadata.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
      };

      if (platformPostId) {
        updateData[`platforms.${platform}.postId`] = platformPostId;
      }

      if (status === "published") {
        updateData["metadata.publishedAt"] =
          admin.firestore.FieldValue.serverTimestamp();
      }

      await db.collection("posts").doc(postId).update(updateData);
    } catch (error) {
      console.error("Error updating post status:", error);
      throw error;
    }
  }
}

module.exports = PlatformPublisher;
