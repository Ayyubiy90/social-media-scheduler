const express = require("express");
const router = express.Router();
const AnalyticsService = require("./src/services/analyticsService.cjs");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");

// Get engagement metrics for a date range
router.get("/engagement", verifyToken, verifySession, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { uid } = req.user;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    console.log(
      `Fetching engagement metrics for user ${uid} from ${startDate} to ${endDate}`
    );

    const metrics = await AnalyticsService.getEngagementMetrics(
      uid,
      startDate,
      endDate
    );

    console.log(`Successfully fetched metrics:`, metrics);
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching engagement metrics:", error);
    res.status(500).json({
      error: "Failed to fetch engagement metrics",
      details: error.message,
    });
  }
});

// Get platform-specific statistics
router.get(
  "/platforms/:platform",
  verifyToken,
  verifySession,
  async (req, res) => {
    try {
      const { platform } = req.params;
      const { uid } = req.user;

      console.log(
        `Fetching platform stats for user ${uid} and platform ${platform}`
      );

      const stats = await AnalyticsService.getPlatformStats(uid, platform);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({
        error: "Failed to fetch platform statistics",
        details: error.message,
      });
    }
  }
);

// Get analytics for specific posts
router.post("/posts", verifyToken, verifySession, async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds)) {
      return res.status(400).json({ error: "postIds must be an array" });
    }

    console.log(`Fetching analytics for posts:`, postIds);

    const analytics = await Promise.all(
      postIds.map((postId) => AnalyticsService.getPostAnalytics(postId))
    );
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching post analytics:", error);
    res.status(500).json({
      error: "Failed to fetch post analytics",
      details: error.message,
    });
  }
});

// Get engagement heatmap data
router.get(
  "/heatmap/:platform",
  verifyToken,
  verifySession,
  async (req, res) => {
    try {
      const { platform } = req.params;
      const { timeframe = "week" } = req.query;
      const { uid } = req.user;

      console.log(
        `Fetching heatmap data for user ${uid}, platform ${platform}, timeframe ${timeframe}`
      );

      const heatmapData = await AnalyticsService.getEngagementHeatmap(
        uid,
        platform,
        timeframe
      );
      res.json(heatmapData);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      res.status(500).json({
        error: "Failed to fetch heatmap data",
        details: error.message,
      });
    }
  }
);

// Update post metrics (called by webhook or background job)
router.post(
  "/metrics/:postId/:platform",
  verifyToken,
  verifySession,
  async (req, res) => {
    try {
      const { postId, platform } = req.params;
      const metrics = req.body;

      console.log(
        `Updating metrics for post ${postId} on platform ${platform}:`,
        metrics
      );

      await AnalyticsService.updatePostMetrics(postId, platform, metrics);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating post metrics:", error);
      res.status(500).json({
        error: "Failed to update post metrics",
        details: error.message,
      });
    }
  }
);

// Export analytics data
router.get("/export", verifyToken, verifySession, async (req, res) => {
  try {
    const { startDate, endDate, format = "json" } = req.query;
    const { uid } = req.user;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    console.log(
      `Exporting analytics data for user ${uid} from ${startDate} to ${endDate} in ${format} format`
    );

    const metrics = await AnalyticsService.getEngagementMetrics(
      uid,
      startDate,
      endDate
    );

    if (format === "csv") {
      const csvRows = [
        // CSV header
        [
          "Date",
          "Likes",
          "Comments",
          "Shares",
          "Clicks",
          "Reach",
          "Impressions",
        ].join(","),
        // CSV data rows
        ...metrics.map((metric) =>
          [
            metric.date,
            metric.likes,
            metric.comments,
            metric.shares,
            metric.clicks,
            metric.reach,
            metric.impressions,
          ].join(",")
        ),
      ];

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=analytics-${startDate}-to-${endDate}.csv`
      );
      res.send(csvRows.join("\n"));
    } else {
      res.json(metrics);
    }
  } catch (error) {
    console.error("Error exporting analytics:", error);
    res.status(500).json({
      error: "Failed to export analytics data",
      details: error.message,
    });
  }
});

// Get platform comparison data
router.get("/comparison", verifyToken, verifySession, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { uid } = req.user;
    const platforms = ["facebook", "twitter", "linkedin", "instagram"];

    console.log(`Fetching platform comparison for user ${uid}`);

    const comparisons = await Promise.all(
      platforms.map(async (platform) => {
        const stats = await AnalyticsService.getPlatformStats(uid, platform);
        return {
          platform,
          metrics: stats,
        };
      })
    );

    res.json(comparisons);
  } catch (error) {
    console.error("Error fetching platform comparison:", error);
    res.status(500).json({
      error: "Failed to fetch platform comparison",
      details: error.message,
    });
  }
});

module.exports = router;
