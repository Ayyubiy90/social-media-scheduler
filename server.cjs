require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const session = require("express-session");
const passport = require("passport");
require("./src/middleware/oauthMiddleware.cjs");
const { verifyToken, verifySession } = require("./src/middleware/authMiddleware.cjs");
const { validatePostMiddleware } = require("./src/middleware/postValidation.cjs");
const {
  createPostJob,
  cancelPostJob,
  reschedulePostJob,
} = require("./jobQueue.cjs");

const app = express();
const port = 5000;

// Debug log to check environment variables
console.log("Environment check - Session Secret exists:", !!process.env.SESSION_SECRET);
console.log("Environment check - OAuth credentials exist:", {
  twitter: {
    apiKeyExists: !!process.env.TWITTER_API_KEY,
    apiSecretExists: !!process.env.TWITTER_API_SECRET,
    callbackUrlExists: !!process.env.TWITTER_CALLBACK_URL
  }
});

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);

// Enable pre-flight requests for all routes
app.options("*", cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware - MUST be before passport initialization
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: true,
    saveUninitialized: true,
    store: new session.MemoryStore(), // Use memory store for development
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN || "localhost",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    },
    name: 'social-scheduler.sid',
    rolling: true
  })
);

// Debug middleware for session
app.use((req, res, next) => {
  console.log('Session Debug:', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    isAuthenticated: req.isAuthenticated?.(),
    user: req.user
  });
  next();
});

// Debug middleware for session
app.use((req, res, next) => {
  console.log('Session Debug:', {
    sessionId: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    isAuthenticated: req.isAuthenticated?.(),
    user: req.user
  });
  next();
});

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require("./authRoutes.cjs");
const notificationRoutes = require("./notificationRoutes.cjs");
const socialRoutes = require("./socialRoutes.cjs");
const analyticsRoutes = require("./analyticsRoutes.cjs");

// Mount routes - MUST be after passport initialization
app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/social", socialRoutes);

// Initialize Firebase and start server
const initializeApp = async () => {
  try {
    // Initialize Firebase with retry logic
    const firebaseInit = require("./firebaseConfig.cjs");
    const db = await firebaseInit;

    // Post management endpoints
    app.post("/schedule", verifyToken, verifySession, (req, res) => {
      const { platform, content, scheduledTime } = req.body;
      createPostJob(platform, content, scheduledTime)
        .then((jobId) => res.json({ jobId }))
        .catch((error) =>
          res.status(500).json({ error: "Failed to schedule post." })
        );
    });

    app.post(
      "/posts",
      verifyToken,
      verifySession,
      validatePostMiddleware,
      async (req, res) => {
        const { content, platforms, draft } = req.body;
        const { uid } = req.user;

        try {
          const newPost = {
            content: {
              text: content.text,
              media: content.media || [],
              links: content.links || [],
            },
            platforms: platforms.reduce((acc, platform) => {
              acc[platform] = { enabled: true, status: "pending" };
              return acc;
            }, {}),
            author: uid,
            draft: draft || false,
            status: draft ? "draft" : "pending",
            analytics: {
              likes: 0,
              shares: 0,
              comments: 0,
              reach: 0,
            },
            metadata: {
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              publishedAt: null,
            },
          };

          const postRef = await db.collection("posts").add(newPost);
          res.status(201).json({
            message: "Post created successfully.",
            postId: postRef.id,
          });
        } catch (error) {
          console.error("Error creating post:", error);
          res.status(500).json({ error: "Failed to create post." });
        }
      }
    );

    app.get("/posts", verifyToken, verifySession, async (req, res) => {
      try {
        const postsSnapshot = await db.collection("posts").get();
        const posts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        res.json(posts);
      } catch (error) {
        console.error("Error retrieving posts:", error);
        res.status(500).json({ error: "Failed to retrieve posts." });
      }
    });

    app.get("/posts/:postId", verifyToken, verifySession, async (req, res) => {
      const { postId } = req.params;

      try {
        const postRef = await db.collection("posts").doc(postId).get();
        if (!postRef.exists) {
          return res.status(404).json({ error: "Post not found." });
        }
        res.json({ id: postRef.id, ...postRef.data() });
      } catch (error) {
        console.error("Error retrieving post:", error);
        res.status(500).json({ error: "Failed to retrieve post." });
      }
    });

    app.put(
      "/posts/:postId",
      verifyToken,
      verifySession,
      validatePostMiddleware,
      async (req, res) => {
        const { postId } = req.params;
        const { content, platforms } = req.body;

        try {
          const postRef = await db.collection("posts").doc(postId).get();
          if (!postRef.exists) {
            return res.status(404).json({ error: "Post not found." });
          }

          const updateData = {
            content: {
              text: content.text,
              media: content.media || [],
              links: content.links || [],
            },
            platforms: platforms.reduce((acc, platform) => {
              acc[platform] = { enabled: true, status: "pending" };
              return acc;
            }, {}),
            "metadata.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
          };

          await postRef.ref.update(updateData);
          res.json({ message: "Post updated successfully." });
        } catch (error) {
          console.error("Error updating post:", error);
          res.status(500).json({ error: "Failed to update post." });
        }
      }
    );

    app.delete(
      "/posts/:postId",
      verifyToken,
      verifySession,
      async (req, res) => {
        const { postId } = req.params;

        try {
          const postRef = await db.collection("posts").doc(postId).get();
          if (!postRef.exists) {
            return res.status(404).json({ error: "Post not found." });
          }

          await postRef.ref.delete();
          res.json({ message: "Post deleted successfully." });
        } catch (error) {
          console.error("Error deleting post:", error);
          res.status(500).json({ error: "Failed to delete post." });
        }
      }
    );

    app.post("/reschedule/:jobId", verifyToken, verifySession, (req, res) => {
      const { jobId } = req.params;
      const { scheduledTime } = req.body;
      reschedulePostJob(jobId, scheduledTime)
        .then(() => res.json({ message: "Post rescheduled successfully." }))
        .catch((error) =>
          res.status(500).json({ error: "Failed to reschedule post." })
        );
    });

    app.delete("/cancel/:jobId", verifyToken, verifySession, (req, res) => {
      const { jobId } = req.params;
      cancelPostJob(jobId)
        .then(() => res.json({ message: "Post canceled successfully." }))
        .catch((error) =>
          res.status(500).json({ error: "Failed to cancel post." })
        );
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`OAuth callback URLs should be configured as:`);
      console.log(`Twitter: http://localhost:${port}/social/twitter/callback`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

// Start the application
initializeApp();
