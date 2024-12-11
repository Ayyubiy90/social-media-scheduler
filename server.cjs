require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const db = require("./firebaseConfig.cjs");
const session = require("express-session");
const passport = require("./src/middleware/oauthMiddleware.cjs");
const {
  createPostJob,
  cancelPostJob,
  reschedulePostJob,
} = require("./jobQueue.cjs");
const authRoutes = require("./authRoutes.cjs");
const notificationRoutes = require("./notificationRoutes.cjs");

const app = express();
const port = 5000;

// Debug log to check environment variables
console.log(
  "Environment check - Session Secret exists:",
  !!process.env.SESSION_SECRET
);
console.log(
  "Environment check - Google Client ID exists:",
  !!process.env.GOOGLE_CLIENT_ID
);

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Your frontend URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// Enable pre-flight requests for all routes
app.options('*', cors());

// Body parser middleware
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Route Middleware
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");
const {
  validatePostMiddleware,
} = require("./src/middleware/postValidation.cjs");

// Routes
app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);

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
      res
        .status(201)
        .json({ message: "Post created successfully.", postId: postRef.id });
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

app.delete("/posts/:postId", verifyToken, verifySession, async (req, res) => {
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
});

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

const setupCollections = require("./dbSetup.cjs");

app.listen(port, async () => {
  await setupCollections();
  console.log(`Server running on port ${port}`);
});
