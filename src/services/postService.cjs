const getDb = require("../../firebaseConfig.cjs");

class PostService {
  static async createPost(userId, postData) {
    try {
      const db = await getDb;
      const postRef = db.collection("posts").doc();
      await postRef.set({
        ...postData,
        userId,
        createdAt: new Date(),
        status: "draft",
      });
      return { id: postRef.id, ...postData };
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  static async getPosts(userId, platform = null) {
    try {
      const db = await getDb;
      let query = db.collection("posts").where("userId", "==", userId);
      if (platform) {
        query = query.where(`platforms.${platform}`, "!=", null);
      }
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }

  static async getPostById(postId) {
    try {
      const db = await getDb;
      const postDoc = await db.collection("posts").doc(postId).get();
      if (!postDoc.exists) {
        throw new Error("Post not found");
      }
      return { id: postDoc.id, ...postDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }

  static async updatePost(postId, updateData) {
    try {
      const db = await getDb;
      const postRef = db.collection("posts").doc(postId);
      await postRef.update(updateData);
      const updated = await postRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  static async deletePost(postId) {
    try {
      const db = await getDb;
      await db.collection("posts").doc(postId).delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  static async schedulePost(postId, scheduleData) {
    try {
      const db = await getDb;
      const { scheduledFor, platforms } = scheduleData;
      await db.collection("posts").doc(postId).update({
        scheduledFor,
        platforms,
        status: "scheduled",
      });
      return { id: postId, scheduledFor, platforms };
    } catch (error) {
      throw new Error(`Failed to schedule post: ${error.message}`);
    }
  }

  static async publishPost(postId, platforms) {
    try {
      const db = await getDb;
      await db.collection("posts").doc(postId).update({
        platforms,
        status: "published",
        publishedAt: new Date(),
      });
      return { id: postId, status: "published", platforms };
    } catch (error) {
      throw new Error(`Failed to publish post: ${error.message}`);
    }
  }
}

module.exports = PostService;
