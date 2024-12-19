const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");
const admin = require("firebase-admin");

// Debug logging function
const debugLog = (message, data) => {
  console.log(`[Social Routes Debug] ${message}:`, data);
};

// OAuth routes for Twitter
const initOAuthConnect = (platform) => async (req, res, next) => {
  const CLIENT_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";
  req.session.returnTo = `${CLIENT_URL}/settings`;

  debugLog(`${platform} Connect Debug`, {
    firebaseToken: req.session?.firebaseToken || "not set",
    authHeader: req.headers.authorization || "not provided",
    sessionId: req.sessionID,
    hasSession: !!req.session,
    user: req.user,
    uid: req.user?.uid,
    token: req.session?.firebaseToken ? "exists" : "missing",
    query: req.query,
    cookies: req.cookies,
    headers: req.headers,
  });

  // Log OAuth configuration
  debugLog(`${platform} OAuth Config`, {
    clientId: platform === 'facebook' ? process.env.VITE_FACEBOOK_APP_ID : process.env.VITE_LINKEDIN_CLIENT_ID,
    clientSecret: 'exists: ' + !!(platform === 'facebook' ? process.env.VITE_FACEBOOK_APP_SECRET : process.env.VITE_LINKEDIN_CLIENT_SECRET),
    callbackUrl: platform === 'facebook' ? process.env.VITE_FACEBOOK_CALLBACK_URL : process.env.VITE_LINKEDIN_CALLBACK_URL,
  });

  // Store the Firebase token in session for the callback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    req.session.firebaseToken = token;
  }

  // Store user ID in session if available
  if (req.user?.uid) {
    req.session.userId = req.user.uid;
  }

  // Store platform in session for callback
  req.session.platform = platform.toLowerCase();

  // Save session before proceeding
  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        reject(err);
      } else {
        debugLog("Session saved successfully", {
          sessionId: req.sessionID,
          userId: req.session.userId,
          platform: req.session.platform,
          hasToken: !!req.session.firebaseToken,
        });
        resolve();
      }
    });
  });

  const authOptions = {
    failureRedirect: `${CLIENT_URL}/settings?error=${platform} authentication failed`,
    session: true,
    state: req.query.state || true,
  };

  // Use scopes defined in oauthMiddleware.cjs
  passport.authenticate(platform.toLowerCase(), {
    ...authOptions,
    failureRedirect: `${CLIENT_URL}/settings?error=${encodeURIComponent(`${platform} authentication failed. Please check your app permissions.`)}`,
    failWithError: true,
  })(req, res, async (err, user) => {
    if (err) {
      console.error(`${platform} authentication error:`, err);
      console.error(`[${platform}] Authentication failed. Check the app settings and permissions.`);
      console.error(`[${platform}] Error details:`, {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
      });
      return res.redirect(`${CLIENT_URL}/settings?error=${encodeURIComponent(err.message || `Failed to connect ${platform}`)}`);
    }
    next();
  });
};

// OAuth connect routes
router.get(
  "/twitter/connect",
  verifyToken,
  verifySession,
  initOAuthConnect("Twitter")
);
router.get(
  "/facebook/connect",
  verifyToken,
  verifySession,
  initOAuthConnect("Facebook")
);
router.get(
  "/linkedin/connect",
  verifyToken,
  verifySession,
  initOAuthConnect("LinkedIn")
);
router.get(
  "/instagram/connect",
  verifyToken,
  verifySession,
  initOAuthConnect("Instagram")
);

// Common callback handler for all platforms
const handleOAuthCallback = (platform) => async (req, res, next) => {
  const CLIENT_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";

  debugLog(`${platform} Callback Debug`, {
    firebaseToken: req.session?.firebaseToken || "not set",
    authHeader: req.headers.authorization || "not provided",
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    token: req.session?.firebaseToken ? "exists" : "missing",
    query: req.query,
    platform: platform,
    cookies: req.cookies,
    headers: req.headers,
    error: req.query.error,
    errorDescription: req.query.error_description,
  });

  // Log OAuth state
  debugLog(`${platform} OAuth State`, {
    state: req.query.state,
    code: req.query.code,
    sessionState: req.session?.state,
    isStateValid: req.query.state === req.session?.state,
  });

  passport.authenticate(
    platform.toLowerCase(),
    { 
      session: true,
      failureRedirect: `${CLIENT_URL}/settings?error=${encodeURIComponent(`${platform} authentication failed`)}`,
      failWithError: true,
      state: false
    },
    async (err, user) => {
      if (err) {
        console.error(`${platform} auth error:`, err);
        console.error(`${platform} auth error details:`, {
          message: err.message,
          code: err.code,
          statusCode: err.statusCode,
          state: req.query.state,
          error: req.query.error,
          errorDescription: req.query.error_description
        });

        // Prepare error details
        const errorDetails = {
          code: err.code,
          statusCode: err.statusCode,
          state: req.query.state,
          error: req.query.error,
          errorDescription: req.query.error_description
        };

        // Send detailed error message via postMessage and close
        const message = {
          type: 'oauth_callback',
          status: 'error',
          error: err.message || `Failed to connect ${platform}. Please check your app permissions and try again.`,
          details: errorDetails
        };

        const html = `
          <!DOCTYPE html>
          <html>
            <body>
              <script>
                window.opener.postMessage(${JSON.stringify(JSON.stringify(message))}, '${CLIENT_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        return res.send(html);
      }

      if (!user) {
        console.error(`${platform} auth failed: No user returned`);
        // Send error message via postMessage and close
        const html = `
          <!DOCTYPE html>
          <html>
            <body>
              <script>
                window.opener.postMessage(JSON.stringify({
                  type: 'oauth_callback',
                  status: 'error',
                  error: 'Failed to connect ${platform} account'
                }), '${CLIENT_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        return res.send(html);
      }

      debugLog(`${platform} User Data`, {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      });

      // Get userId from session or verify token
      let userId = req.session?.userId;
      if (!userId && req.session?.firebaseToken) {
        try {
          const decodedToken = await admin
            .auth()
            .verifyIdToken(req.session.firebaseToken);
          userId = decodedToken.uid;
        } catch (error) {
          console.error("Token verification error:", error);
        }
      }

      if (!userId) {
        console.error(`${platform} auth failed: No user ID in session`);
        // Send error message via postMessage and close
        const html = `
          <!DOCTYPE html>
          <html>
            <body>
              <script>
                window.opener.postMessage(JSON.stringify({
                  type: 'oauth_callback',
                  status: 'error',
                  error: 'Please log in before connecting ${platform}'
                }), '${CLIENT_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        return res.send(html);
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

          const platformLower = platform.toLowerCase();
          const updateData = {
            [`${platformLower}Profile`]: {
              id: user.id,
              username: user.username || user.id,
              name: user.displayName,
              email: user._json?.email,
            },
            [`${platformLower}Connected`]: true,
            [`${platformLower}ConnectedAt`]:
              admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          };

          // Store tokens if available
          if (user.token) updateData[`${platformLower}Token`] = user.token;
          if (user.tokenSecret)
            updateData[`${platformLower}TokenSecret`] = user.tokenSecret;
          if (user.accessToken)
            updateData[`${platformLower}AccessToken`] = user.accessToken;
          if (user.refreshToken)
            updateData[`${platformLower}RefreshToken`] = user.refreshToken;

          debugLog(`Updating user document with ${platform} profile`, userId);
          transaction.update(userRef, updateData);
        });

        debugLog("Firestore update successful", userId);
        // Send success message via postMessage and close
        const html = `
          <!DOCTYPE html>
          <html>
            <body>
              <script>
                window.opener.postMessage(JSON.stringify({
                  type: 'oauth_callback',
                  status: 'success'
                }), '${CLIENT_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        return res.send(html);
      } catch (error) {
        console.error(`Error in ${platform} callback:`, error);
        // Send error message via postMessage and close
        const html = `
          <!DOCTYPE html>
          <html>
            <body>
              <script>
                window.opener.postMessage(JSON.stringify({
                  type: 'oauth_callback',
                  status: 'error',
                  error: 'Failed to connect ${platform} account. Please try again.'
                }), '${CLIENT_URL}');
                window.close();
              </script>
            </body>
          </html>
        `;
        return res.send(html);
      }
    }
  )(req, res, next);
};

// OAuth callback routes
router.get("/twitter/callback", verifySession, handleOAuthCallback("Twitter"));
router.get(
  "/facebook/callback",
  verifySession,
  handleOAuthCallback("Facebook")
);
router.get(
  "/linkedin/callback",
  verifySession,
  handleOAuthCallback("LinkedIn")
);
router.get(
  "/instagram/callback",
  verifySession,
  handleOAuthCallback("Instagram")
);

// Get connected accounts
router.get(
  "/connected-accounts",
  verifyToken,
  verifySession,
  async (req, res) => {
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
        const platforms = ["twitter", "facebook", "linkedin", "instagram"];

        // Initialize accounts array
        const accounts = platforms.map((platform) => {
          const profile = userData[`${platform}Profile`] || null;
          const connected = !!profile && userData[`${platform}Connected`];

          let profileUrl = null;
          if (profile?.username) {
            switch (platform) {
              case "twitter":
                profileUrl = `https://twitter.com/${profile.username}`;
                break;
              case "facebook":
                profileUrl = `https://facebook.com/${profile.username}`;
                break;
              case "linkedin":
                profileUrl = `https://linkedin.com/in/${profile.username}`;
                break;
              case "instagram":
                profileUrl = `https://instagram.com/${profile.username}`;
                break;
            }
          }

          return {
            platform,
            connected,
            accountName: profile?.username || null,
            profileUrl,
          };
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
  }
);

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

      const platformLower = platform.toLowerCase();
      const updateData = {
        [`${platformLower}Profile`]: null,
        [`${platformLower}Connected`]: false,
        [`${platformLower}DisconnectedAt`]:
          admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Clear tokens if they exist
      updateData[`${platformLower}Token`] = null;
      updateData[`${platformLower}TokenSecret`] = null;
      updateData[`${platformLower}AccessToken`] = null;
      updateData[`${platformLower}RefreshToken`] = null;

      await admin.firestore().collection("users").doc(uid).update(updateData);

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
