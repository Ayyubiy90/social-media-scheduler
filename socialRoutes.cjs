const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");

// OAuth routes for each platform
router.get("/twitter/connect", (req, res, next) => {
  // Store return URL and user ID in session
  req.session.returnTo = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/settings`;

  console.log("Twitter Connect Debug:", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    user: req.user,
    uid: req.user?.uid,
  });

  // Store user ID in session before Twitter auth
  if (req.user?.uid) {
    req.session.userId = req.user.uid;
    console.log("Stored user ID in session:", req.user.uid);
  } else {
    console.error("No user ID available to store in session");
    return res.redirect(
      `${
        process.env.CLIENT_URL || "http://localhost:5173"
      }/settings?error=Please log in before connecting Twitter`
    );
  }

  // Save session before redirecting to Twitter
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/settings?error=Failed to save session`
      );
    }
    console.log("Session saved successfully, proceeding with Twitter auth");
    passport.authenticate("twitter")(req, res, next);
  });
});

router.get("/twitter/callback", (req, res, next) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectToSettings = (error) => {
    const url = new URL(`${CLIENT_URL}/settings`);
    if (error) {
      url.searchParams.set("error", encodeURIComponent(error));
    }
    url.searchParams.set("oauth_callback", "true");
    return res.redirect(url.toString());
  };

  console.log("Twitter Callback Debug:", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    isAuthenticated: req.isAuthenticated?.(),
    user: req.user,
    query: req.query,
    oauthToken: req.query.oauth_token,
    oauthVerifier: req.query.oauth_verifier,
  });

  // Check if we have OAuth parameters
  if (!req.query.oauth_token || !req.query.oauth_verifier) {
    console.error("Missing OAuth parameters:", req.query);
    return redirectToSettings("Twitter authentication was cancelled or failed");
  }

  passport.authenticate(
    "twitter",
    { session: false },
    async (err, twitterUser) => {
      if (err) {
        console.error("Twitter auth error:", err);
        return redirectToSettings(err.message);
      }

      if (!twitterUser) {
        console.error("Twitter auth failed: No user returned");
        return redirectToSettings("Failed to connect Twitter account");
      }

      // Check if we have the original user ID in session
      const userId = req.session?.userId;
      if (!userId) {
        console.error("Twitter auth failed: No user ID in session");
        return redirectToSettings("Please log in before connecting Twitter");
      }

      // Restore the user ID from session
      req.user = { uid: userId };

      // Update the user's Twitter profile in Firestore
      const admin = require("firebase-admin");
      const db = admin.firestore();

      try {
        console.log("Updating Firestore with Twitter profile:", {
          userId: req.user.uid,
          twitterUsername: twitterUser.username,
          twitterId: twitterUser.id,
        });

        // Get user document reference
        const userRef = db.collection("users").doc(req.user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          throw new Error("User document not found");
        }

        // Update user document with Twitter profile
        await userRef.update({
          twitterProfile: {
            id: twitterUser.id,
            username: twitterUser.username,
            name: twitterUser.displayName,
            profile_image_url: twitterUser.photos?.[0]?.value,
          },
          twitterConnected: true,
          twitterConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
          twitterToken: twitterUser.token,
          twitterTokenSecret: twitterUser.tokenSecret,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Firestore update successful");

        // Save session changes
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              reject(err);
            } else {
              console.log("Session saved successfully");
              resolve();
            }
          });
        });

        // Clear Twitter connection state
        delete req.session.userId;

        console.log("Twitter connection successful");
        return redirectToSettings(null);
      } catch (error) {
        console.error("Error in Twitter callback:", error);
        const errorMessage =
          error.message === "User document not found"
            ? "User not found. Please try logging in again."
            : "Failed to connect Twitter account. Please try again.";
        return redirectToSettings(errorMessage);
      }
    }
  )(req, res, next);
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
          twitterToken: null,
          twitterTokenSecret: null,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
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
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
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
