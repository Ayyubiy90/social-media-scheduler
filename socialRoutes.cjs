const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");

// OAuth routes for each platform
router.get("/twitter/connect", (req, res, next) => {
  // Store return URL in session
  req.session.returnTo = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/settings`;

  passport.authenticate("twitter")(req, res, next);
});

router.get("/twitter/callback", (req, res, next) => {
  passport.authenticate("twitter", (err, user) => {
    if (err) {
      console.error("Twitter auth error:", err);
      return res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/settings?error=${encodeURIComponent(err.message)}`
      );
    }
    if (!user) {
      return res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/settings?error=twitter_auth_failed`
      );
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.redirect(
          `${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/settings?error=${encodeURIComponent(loginErr.message)}`
        );
      }
      // Redirect back to the client settings page
      res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/settings`
      );
    });
  })(req, res, next);
});

// Get connected accounts
router.get("/connected-accounts", async (req, res) => {
  try {
    // If no user is authenticated, return default accounts
    if (!req.user?.uid) {
      return res.json([
        { platform: "twitter", connected: false },
        { platform: "facebook", connected: false },
        { platform: "linkedin", connected: false },
        { platform: "instagram", connected: false },
      ]);
    }

    const { uid } = req.user;
    const admin = require("firebase-admin");
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    // Check for Twitter-specific data first
    const twitterProfile = userData.twitterProfile || null;
    const twitterConnected = !!twitterProfile;

    // Initialize response array with Twitter data
    const accounts = [
      {
        platform: "twitter",
        connected: twitterConnected,
        accountName: twitterProfile?.username || null,
        profileUrl: twitterProfile
          ? `https://twitter.com/${twitterProfile.username}`
          : null,
      },
    ];

    // Add other platforms with default values
    ["facebook", "linkedin", "instagram"].forEach((platform) => {
      accounts.push({
        platform,
        connected: false,
        accountName: null,
        profileUrl: null,
      });
    });

    res.json(accounts);
  } catch (error) {
    console.error("Error getting connected accounts:", error);
    res.status(500).json({ error: "Failed to get connected accounts" });
  }
});

// Disconnect platform account
router.delete(
  "/:platform/disconnect",
  verifyToken,
  verifySession,
  async (req, res) => {
    try {
      const { platform } = req.params;
      const { uid } = req.user;

      if (
        !["facebook", "twitter", "linkedin", "instagram"].includes(platform)
      ) {
        return res.status(400).json({ error: "Invalid platform" });
      }

      const admin = require("firebase-admin");
      const db = admin.firestore();

      if (platform === "twitter") {
        await db.collection("users").doc(uid).update({
          twitterProfile: null,
          twitterConnected: false,
          twitterDisconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await db
          .collection("users")
          .doc(uid)
          .update({
            [`connectedAccounts.${platform}`]: {
              connected: false,
              disconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      res.status(500).json({ error: "Failed to disconnect platform" });
    }
  }
);

// Get platform limits
router.get("/:platform/limits", verifyToken, verifySession, (req, res) => {
  const { platform } = req.params;

  const limits = {
    facebook: {
      characterLimit: 63206,
      mediaLimit: 10,
      mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
      rateLimit: { posts: 50, timeWindow: "24h" },
    },
    twitter: {
      characterLimit: 280,
      mediaLimit: 4,
      mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
      rateLimit: { posts: 300, timeWindow: "3h" },
    },
    linkedin: {
      characterLimit: 3000,
      mediaLimit: 9,
      mediaTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
      rateLimit: { posts: 100, timeWindow: "24h" },
    },
    instagram: {
      characterLimit: 2200,
      mediaLimit: 10,
      mediaTypes: ["image/jpeg", "image/png", "video/mp4"],
      rateLimit: { posts: 25, timeWindow: "24h" },
    },
  };

  if (!limits[platform]) {
    return res.status(400).json({ error: "Invalid platform" });
  }

  res.json(limits[platform]);
});

// Validate post content
router.post("/:platform/validate", verifyToken, verifySession, (req, res) => {
  const { platform } = req.params;
  const { content, mediaUrls } = req.body;

  const errors = [];
  const limits = {
    facebook: { text: 63206, media: 10 },
    twitter: { text: 280, media: 4 },
    linkedin: { text: 3000, media: 9 },
    instagram: { text: 2200, media: 10 },
  };

  if (!limits[platform]) {
    return res.status(400).json({ error: "Invalid platform" });
  }

  // Check content length
  if (content && content.length > limits[platform].text) {
    errors.push(`Content exceeds ${platform} character limit`);
  }

  // Check media count
  if (mediaUrls && mediaUrls.length > limits[platform].media) {
    errors.push(`Too many media items for ${platform}`);
  }

  res.json({
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  });
});

// Get post preview
router.post("/:platform/preview", verifyToken, verifySession, (req, res) => {
  const { platform } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  let preview = content;
  if (platform === "twitter" && content.length > 280) {
    preview = content.substring(0, 277) + "...";
  }

  res.json({ preview });
});

module.exports = router;
