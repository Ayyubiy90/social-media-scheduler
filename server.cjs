require('dotenv').config();
const express = require("express");
const cors = require("cors");
const admin = require('firebase-admin');
const db = require('./firebaseConfig.cjs');
const session = require('express-session');
const passport = require('./src/middleware/oauthMiddleware.cjs');
const {
  createPostJob,
  cancelPostJob,
  reschedulePostJob,
  createNotificationJob,
  cancelNotificationJob,
  rescheduleNotificationJob,
} = require("./jobQueue.cjs");
const authRoutes = require("./authRoutes.cjs");

const app = express();
const port = 5000;

// Debug log to check environment variables
console.log('Environment check - Session Secret exists:', !!process.env.SESSION_SECRET);
console.log('Environment check - Google Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.use("/auth", authRoutes);

// Post management endpoints
const { verifyToken, verifySession } = require('./src/middleware/authMiddleware.cjs');

app.post("/schedule", (req, res) => {
  const { platform, content, scheduledTime } = req.body;
  createPostJob(platform, content, scheduledTime)
    .then((jobId) => res.json({ jobId }))
    .catch((error) =>
      res.status(500).json({ error: "Failed to schedule post." })
    );
});

app.post("/posts", verifyToken, verifySession, async (req, res) => {
  const { content, draft } = req.body;
  const { uid } = req.user;

  // Content validation
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content cannot be empty' });
  }

  try {
    const newPost = {
      content,
      author: uid,
      draft: draft || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const postRef = await db.collection('posts').add(newPost);
    res.status(201).json({ message: "Post created successfully.", postId: postRef.id });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

app.get("/posts", verifyToken, verifySession, async (req, res) => {
  try {
    const postsSnapshot = await db.collection('posts').get();
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(posts);
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

app.get("/posts/:postId", verifyToken, verifySession, async (req, res) => {
  const { postId } = req.params;

  try {
    const postRef = await db.collection('posts').doc(postId).get();
    if (!postRef.exists) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json({ id: postRef.id, ...postRef.data() });
  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'Failed to retrieve post.' });
  }
});

app.put("/posts/:postId", verifyToken, verifySession, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  // Content validation
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content cannot be empty' });
  }

  try {
    const postRef = await db.collection('posts').doc(postId).get();
    if (!postRef.exists) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    await postRef.ref.update({ content });
    res.json({ message: "Post updated successfully." });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post.' });
  }
});

app.delete("/posts/:postId", verifyToken, verifySession, async (req, res) => {
  const { postId } = req.params;

  try {
    const postRef = await db.collection('posts').doc(postId).get();
    if (!postRef.exists) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    await postRef.ref.delete();
    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

app.post("/reschedule/:jobId", (req, res) => {
  const { jobId } = req.params;
  const { scheduledTime } = req.body;
  reschedulePostJob(jobId, scheduledTime)
    .then(() => res.json({ message: "Post rescheduled successfully." }))
    .catch((error) =>
      res.status(500).json({ error: "Failed to reschedule post." })
    );
});

app.delete("/cancel/:jobId", (req, res) => {
  const { jobId } = req.params;
  cancelPostJob(jobId)
    .then(() => res.json({ message: "Post canceled successfully." }))
    .catch((error) =>
      res.status(500).json({ error: "Failed to cancel post." })
    );
});

// Notification endpoints
app.post("/notifications", verifyToken, verifySession, async (req, res) => {
  const { userId, postId, scheduledTime } = req.body;
  try {
    const job = await createNotificationJob(userId, postId, scheduledTime);
    res.json({ 
      message: "Notification created successfully.",
      notificationId: job.id
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: "Failed to create notification." });
  }
});

app.get("/notifications", verifyToken, verifySession, async (req, res) => {
  const { uid } = req.user;
  try {
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', uid)
      .get();
    
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(notifications);
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

app.put("/notifications/:notifId", verifyToken, verifySession, async (req, res) => {
  const { notifId } = req.params;
  const { scheduledTime } = req.body;
  try {
    await rescheduleNotificationJob(notifId, scheduledTime);
    res.json({ message: "Notification updated successfully." });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: "Failed to update notification." });
  }
});

app.delete("/notifications/:notifId", verifyToken, verifySession, async (req, res) => {
  const { notifId } = req.params;
  try {
    await cancelNotificationJob(notifId);
    res.json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message || "Failed to delete notification." });
  }
});

const setupCollections = require('./dbSetup.cjs');

app.listen(port, async () => {
  await setupCollections();
  console.log(`Server is running on port ${port}`);
});
