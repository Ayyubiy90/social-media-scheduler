require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./src/middleware/oauthMiddleware.cjs");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");
const {
  validatePostMiddleware,
} = require("./src/middleware/postValidation.cjs");
const {
  createPostJob,
  cancelPostJob,
  reschedulePostJob,
} = require("./jobQueue.cjs");

const app = express();
const port = 5000;

const CLIENT_URL = process.env.VITE_CLIENT_URL || "http://localhost:5173";

// CORS configuration
const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Trust first proxy for secure cookies
app.set("trust proxy", 1);

// Cookie parser middleware
app.use(cookieParser(process.env.VITE_SESSION_SECRET));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware - MUST be before passport initialization
app.use(
  session({
    secret: process.env.VITE_SESSION_SECRET || "default-secret-key",
    resave: true,
    saveUninitialized: true,
    store: new session.MemoryStore(),
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      sameSite: "lax", // Changed from 'none' to 'lax' for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    },
    name: "social-scheduler.sid",
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware for session and auth
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    // Store token in session
    req.session.firebaseToken = token;
    // Save session immediately
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      }
    });
  }

  // Debug logging
  console.log("Request Debug:", {
    url: req.url,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionData: req.session,
    firebaseToken: req.session?.firebaseToken ? "exists" : "missing",
    headers: {
      authorization: req.headers.authorization ? "exists" : "missing",
      cookie: req.headers.cookie,
    }
  });

  next();
});

// Import routes
const authRoutes = require("./authRoutes.cjs");
const notificationRoutes = require("./notificationRoutes.cjs");
const socialRoutes = require("./socialRoutes.cjs");
const analyticsRoutes = require("./analyticsRoutes.cjs");

// Mount routes
app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/social", socialRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

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

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Client URL: ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

// Start the application
initializeApp();
