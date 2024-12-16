const admin = require("firebase-admin");
const getDb = require("../../firebaseConfig.cjs");

class AnalyticsService {
  static async getDb() {
    return await getDb;
  }

  static async updatePostMetrics(postId, platform, metrics) {
    try {
      const db = await this.getDb();
      const postRef = db.collection("posts").doc(postId);
      const post = await postRef.get();

      if (!post.exists) {
        throw new Error("Post not found");
      }

      const updateData = {
        [`analytics.${platform}`]: {
          ...metrics,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      };

      await postRef.update(updateData);
      return true;
    } catch (error) {
      console.error("Error updating post metrics:", error);
      throw error;
    }
  }

  static async getPostAnalytics(postId) {
    try {
      const db = await this.getDb();
      const postRef = db.collection("posts").doc(postId);
      const post = await postRef.get();

      if (!post.exists) {
        throw new Error("Post not found");
      }

      return post.data().analytics || {};
    } catch (error) {
      console.error("Error getting post analytics:", error);
      throw error;
    }
  }

  static async getPlatformStats(userId, platform) {
    try {
      const db = await this.getDb();
      const postsRef = db.collection("posts");
      const posts = await postsRef
        .where("userId", "==", userId)
        .where(`platforms.${platform}.status`, "==", "published")
        .get();

      let totalEngagement = 0;
      let totalPosts = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;

      posts.forEach((post) => {
        const analytics = post.data().analytics?.[platform];
        if (analytics) {
          totalPosts++;
          totalLikes += analytics.likes || 0;
          totalComments += analytics.comments || 0;
          totalShares += analytics.shares || 0;
          totalEngagement +=
            (analytics.likes || 0) +
            (analytics.comments || 0) +
            (analytics.shares || 0);
        }
      });

      return {
        platform,
        totalPosts,
        averageLikes: totalPosts ? totalLikes / totalPosts : 0,
        averageComments: totalPosts ? totalComments / totalPosts : 0,
        averageShares: totalPosts ? totalShares / totalPosts : 0,
        engagementRate: totalPosts ? totalEngagement / totalPosts : 0,
      };
    } catch (error) {
      console.error("Error getting platform stats:", error);
      throw error;
    }
  }

  static async getEngagementMetrics(userId, startDate, endDate) {
    try {
      const db = await this.getDb();
      const postsRef = db.collection("posts");

      // Convert string dates to Firestore Timestamps
      const startTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(startDate)
      );
      const endTimestamp = admin.firestore.Timestamp.fromDate(
        new Date(endDate)
      );

      const posts = await postsRef
        .where("userId", "==", userId)
        .where("metadata.publishedAt", ">=", startTimestamp)
        .where("metadata.publishedAt", "<=", endTimestamp)
        .get();

      const metrics = {};

      posts.forEach((post) => {
        const data = post.data();
        const publishDate = data.metadata.publishedAt.toDate();
        const dateKey = publishDate.toISOString().split("T")[0];

        if (!metrics[dateKey]) {
          metrics[dateKey] = {
            likes: 0,
            comments: 0,
            shares: 0,
            clicks: 0,
            reach: 0,
            impressions: 0,
          };
        }

        // Aggregate metrics across all platforms
        Object.values(data.analytics || {}).forEach((platformMetrics) => {
          metrics[dateKey].likes += platformMetrics.likes || 0;
          metrics[dateKey].comments += platformMetrics.comments || 0;
          metrics[dateKey].shares += platformMetrics.shares || 0;
          metrics[dateKey].clicks += platformMetrics.clicks || 0;
          metrics[dateKey].reach += platformMetrics.reach || 0;
          metrics[dateKey].impressions += platformMetrics.impressions || 0;
        });
      });

      // Convert to array and sort by date
      return Object.entries(metrics)
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error getting engagement metrics:", error);
      throw error;
    }
  }

  static async getEngagementHeatmap(userId, platform, timeframe) {
    try {
      const db = await this.getDb();
      const postsRef = db.collection("posts");
      const posts = await postsRef
        .where("userId", "==", userId)
        .where(`platforms.${platform}.status`, "==", "published")
        .get();

      const heatmapData = Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: 24 }, (_, hour) => ({
          day,
          hour,
          value: 0,
        }))
      ).flat();

      posts.forEach((post) => {
        const data = post.data();
        const publishDate = data.metadata.publishedAt.toDate();
        const analytics = data.analytics?.[platform];

        if (analytics) {
          const day = publishDate.getDay();
          const hour = publishDate.getHours();
          const index = day * 24 + hour;

          heatmapData[index].value +=
            (analytics.likes || 0) +
            (analytics.comments || 0) +
            (analytics.shares || 0);
        }
      });

      return heatmapData;
    } catch (error) {
      console.error("Error getting engagement heatmap:", error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
