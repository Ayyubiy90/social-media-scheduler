const express = require("express");
const cors = require("cors");
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

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/auth", authRoutes);

// Post management endpoints
app.post("/schedule", (req, res) => {
  const { platform, content, scheduledTime } = req.body;
  createPostJob(platform, content, scheduledTime)
    .then((jobId) => res.json({ jobId }))
    .catch((error) =>
      res.status(500).json({ error: "Failed to schedule post." })
    );
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
app.post("/notifications", (req, res) => {
  const { userId, postId, scheduledTime } = req.body;
  createNotificationJob(userId, postId, scheduledTime)
    .then((job) => res.json({ 
      message: "Notification created successfully.",
      notificationId: job.id
    }))
    .catch((error) =>
      res.status(500).json({ error: "Failed to create notification." })
    );
});

app.get("/notifications", (req, res) => {
  // Implement logic to retrieve notifications for the user
  res.json({ message: "Retrieve notifications endpoint" });
});

app.put("/notifications/:notifId", (req, res) => {
  const { notifId } = req.params;
  const { scheduledTime } = req.body;
  rescheduleNotificationJob(notifId, scheduledTime)
    .then(() => res.json({ message: "Notification updated successfully." }))
    .catch((error) =>
      res.status(500).json({ error: "Failed to update notification." })
    );
});

app.delete("/notifications/:notifId", async (req, res) => {
  const { notifId } = req.params;
  try {
    await cancelNotificationJob(notifId);
    res.json({ message: "Notification deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete notification." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
