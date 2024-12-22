require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./src/middleware/oauthMiddleware.cjs");
const {
  verifyToken,
  verifySession,
} = require("./src/middleware/authMiddleware.cjs");
const {
  validatePostMedia,
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
    },
  });

  next();
});

// Import routes
const authRoutes = require("./authRoutes.cjs");
const notificationRoutes = require("./notificationRoutes.cjs");
const socialRoutes = require("./socialRoutes.cjs");
const analyticsRoutes = require("./analyticsRoutes.cjs");
const postRoutes = require("./postRoutes.cjs");

// Mount routes
app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/social", socialRoutes);
app.use("/posts", postRoutes);

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

    // Post scheduling endpoint
    app.post("/schedule", verifyToken, verifySession, async (req, res) => {
      const { platform, content, scheduledTime } = req.body;
      try {
        const jobId = await createPostJob(platform, content, scheduledTime);
        res.json({ jobId });
      } catch (error) {
        console.error("Failed to schedule post:", error);
        res.status(500).json({ error: "Failed to schedule post." });
      }
    });

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
