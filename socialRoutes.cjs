const express = require("express");
const router = express.Router();
const passport = require("passport");
const { verifyToken, verifySession } = require("./src/middleware/authMiddleware.cjs");
const admin = require("firebase-admin");

// Debug logging function
const debugLog = (message, data) => {
  console.log(`[Social Routes Debug] ${message}:`, data);
};

// OAuth routes for Twitter
router.get("/twitter/connect", verifyToken, verifySession, (req, res, next) => {
  req.session.returnTo = `${process.env.CLIENT_URL || "http://localhost:5173"}/settings`;
  debugLog("Twitter Connect Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    user: req.user,
    uid: req.user?.uid,
  });

  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/settings?error=Failed to save session`);
    }
    debugLog("Session saved successfully", "proceeding with Twitter auth");
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
    return res.redirect(url.toString());
  };

  debugLog("Twitter Callback Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    query: req.query,
  });

  passport.authenticate("twitter", { session: false }, async (err, twitterUser) => {
    if (err) {
      console.error("Twitter auth error:", err);
      return redirectToSettings(err.message);
    }

    if (!twitterUser) {
      console.error("Twitter auth failed: No user returned");
      return redirectToSettings("Failed to connect Twitter account");
    }

    debugLog("Twitter User Data", {
      id: twitterUser.id,
      username: twitterUser.username,
      displayName: twitterUser.displayName,
    });

    const userId = req.session?.userId;
    if (!userId) {
      console.error("Twitter auth failed: No user ID in session");
      return redirectToSettings("Please log in before connecting Twitter");
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          debugLog("Creating new user document", userId);
          transaction.set(userRef, {
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        debugLog("Updating user document with Twitter profile", userId);
        transaction.update(userRef, {
          twitterProfile: {
            id: twitterUser.id,
            username: twitterUser.username,
            name: twitterUser.displayName,
          },
          twitterConnected: true,
          twitterConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      debugLog("Firestore update successful", userId);
      return redirectToSettings(null);
    } catch (error) {
      console.error("Error in Twitter callback:", error);
      return redirectToSettings("Failed to connect Twitter account. Please try again.");
    }
  })(req, res, next);
});

// OAuth routes for Facebook
router.get("/facebook/connect", verifyToken, verifySession, (req, res, next) => {
  req.session.returnTo = `${process.env.CLIENT_URL || "http://localhost:5173"}/settings`;
  debugLog("Facebook Connect Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    user: req.user,
    uid: req.user?.uid,
  });

  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/settings?error=Failed to save session`);
    }
    debugLog("Session saved successfully", "proceeding with Facebook auth");
    passport.authenticate("facebook")(req, res, next);
  });
});

router.get("/facebook/callback", (req, res, next) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectToSettings = (error) => {
    const url = new URL(`${CLIENT_URL}/settings`);
    if (error) {
      url.searchParams.set("error", encodeURIComponent(error));
    }
    return res.redirect(url.toString());
  };

  debugLog("Facebook Callback Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    query: req.query,
  });

  passport.authenticate("facebook", { session: false }, async (err, facebookUser) => {
    if (err) {
      console.error("Facebook auth error:", err);
      return redirectToSettings(err.message);
    }

    if (!facebookUser) {
      console.error("Facebook auth failed: No user returned");
      return redirectToSettings("Failed to connect Facebook account");
    }

    debugLog("Facebook User Data", {
      id: facebookUser.id,
      username: facebookUser.username,
      displayName: facebookUser.displayName,
    });

    const userId = req.session?.userId;
    if (!userId) {
      console.error("Facebook auth failed: No user ID in session");
      return redirectToSettings("Please log in before connecting Facebook");
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          debugLog("Creating new user document", userId);
          transaction.set(userRef, {
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        debugLog("Updating user document with Facebook profile", userId);
        transaction.update(userRef, {
          facebookProfile: {
            id: facebookUser.id,
            username: facebookUser.username,
            name: facebookUser.displayName,
          },
          facebookConnected: true,
          facebookConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      debugLog("Firestore update successful", userId);
      return redirectToSettings(null);
    } catch (error) {
      console.error("Error in Facebook callback:", error);
      return redirectToSettings("Failed to connect Facebook account. Please try again.");
    }
  })(req, res, next);
});

// OAuth routes for LinkedIn
router.get("/linkedin/connect", verifyToken, verifySession, (req, res, next) => {
  req.session.returnTo = `${process.env.CLIENT_URL || "http://localhost:5173"}/settings`;
  debugLog("LinkedIn Connect Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    user: req.user,
    uid: req.user?.uid,
  });

  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/settings?error=Failed to save session`);
    }
    debugLog("Session saved successfully", "proceeding with LinkedIn auth");
    passport.authenticate("linkedin")(req, res, next);
  });
});

router.get("/linkedin/callback", (req, res, next) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectToSettings = (error) => {
    const url = new URL(`${CLIENT_URL}/settings`);
    if (error) {
      url.searchParams.set("error", encodeURIComponent(error));
    }
    return res.redirect(url.toString());
  };

  debugLog("LinkedIn Callback Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    query: req.query,
  });

  passport.authenticate("linkedin", { session: false }, async (err, linkedinUser) => {
    if (err) {
      console.error("LinkedIn auth error:", err);
      return redirectToSettings(err.message);
    }

    if (!linkedinUser) {
      console.error("LinkedIn auth failed: No user returned");
      return redirectToSettings("Failed to connect LinkedIn account");
    }

    debugLog("LinkedIn User Data", {
      id: linkedinUser.id,
      username: linkedinUser.username,
      displayName: linkedinUser.displayName,
    });

    const userId = req.session?.userId;
    if (!userId) {
      console.error("LinkedIn auth failed: No user ID in session");
      return redirectToSettings("Please log in before connecting LinkedIn");
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          debugLog("Creating new user document", userId);
          transaction.set(userRef, {
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        debugLog("Updating user document with LinkedIn profile", userId);
        transaction.update(userRef, {
          linkedinProfile: {
            id: linkedinUser.id,
            username: linkedinUser.username,
            name: linkedinUser.displayName,
          },
          linkedinConnected: true,
          linkedinConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      debugLog("Firestore update successful", userId);
      return redirectToSettings(null);
    } catch (error) {
      console.error("Error in LinkedIn callback:", error);
      return redirectToSettings("Failed to connect LinkedIn account. Please try again.");
    }
  })(req, res, next);
});

// OAuth routes for Instagram
router.get("/instagram/connect", verifyToken, verifySession, (req, res, next) => {
  req.session.returnTo = `${process.env.CLIENT_URL || "http://localhost:5173"}/settings`;
  debugLog("Instagram Connect Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    user: req.user,
    uid: req.user?.uid,
  });

  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/settings?error=Failed to save session`);
    }
    debugLog("Session saved successfully", "proceeding with Instagram auth");
    passport.authenticate("instagram")(req, res, next);
  });
});

router.get("/instagram/callback", (req, res, next) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectToSettings = (error) => {
    const url = new URL(`${CLIENT_URL}/settings`);
    if (error) {
      url.searchParams.set("error", encodeURIComponent(error));
    }
    return res.redirect(url.toString());
  };

  debugLog("Instagram Callback Debug", {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    query: req.query,
  });

  passport.authenticate("instagram", { session: false }, async (err, instagramUser) => {
    if (err) {
      console.error("Instagram auth error:", err);
      return redirectToSettings(err.message);
    }

    if (!instagramUser) {
      console.error("Instagram auth failed: No user returned");
      return redirectToSettings("Failed to connect Instagram account");
    }

    debugLog("Instagram User Data", {
      id: instagramUser.id,
      username: instagramUser.username,
      displayName: instagramUser.displayName,
    });

    const userId = req.session?.userId;
    if (!userId) {
      console.error("Instagram auth failed: No user ID in session");
      return redirectToSettings("Please log in before connecting Instagram");
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          debugLog("Creating new user document", userId);
          transaction.set(userRef, {
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        debugLog("Updating user document with Instagram profile", userId);
        transaction.update(userRef, {
          instagramProfile: {
            id: instagramUser.id,
            username: instagramUser.username,
            name: instagramUser.displayName,
          },
          instagramConnected: true,
          instagramConnectedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      debugLog("Firestore update successful", userId);
      return redirectToSettings(null);
    } catch (error) {
      console.error("Error in Instagram callback:", error);
      return redirectToSettings("Failed to connect Instagram account. Please try again.");
    }
  })(req, res, next);
});

// Get connected accounts
router.get("/connected-accounts", verifyToken, verifySession, async (req, res) => {
  try {
    debugLog("Getting connected accounts for user", req.user?.uid);
    
    const { uid } = req.user;
    const userRef = admin.firestore().collection("users").doc(uid);
    
    try {
      const userDoc = await userRef.get();
      debugLog("User document exists", userDoc.exists);

      if (!userDoc.exists) {
        debugLog("Creating new user document", uid);
        await userRef.set({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Return default accounts since we just created the document
        return res.json([
          { platform: "twitter", connected: false },
          { platform: "facebook", connected: false },
          { platform: "linkedin", connected: false },
          { platform: "instagram", connected: false },
        ]);
      }

      const userData = userDoc.data();
      debugLog("User data", {
        hasTwitterProfile: !!userData.twitterProfile,
        twitterConnected: userData.twitterConnected,
        twitterUsername: userData.twitterProfile?.username
      });

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

      debugLog("Returning accounts", accounts);
      res.json(accounts);
    } catch (error) {
      console.error("Error accessing Firestore:", error);
      throw error;
    }
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

      if (platform === "twitter") {
        await admin.firestore().collection("users").doc(uid).update({
          twitterProfile: null,
          twitterConnected: false,
          twitterDisconnectedAt: admin.firestore.FieldValue.serverTimestamp(),
          twitterToken: null,
          twitterTokenSecret: null,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await admin.firestore()
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
