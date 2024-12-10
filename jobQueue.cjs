const Queue = require("bull");
const redis = require("redis");
const admin = require("firebase-admin");
const db = require("./firebaseConfig.cjs");
const PlatformPublisher = require("./src/services/platformPublisher.cjs");

const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

// Configure queues with retry strategies
const postQueue = new Queue("postQueue", {
  redis: "redis://127.0.0.1:6379",
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 30000, // 30 seconds
    maxStalledCount: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5 seconds initial delay
    },
    attempts: 5, // Maximum retry attempts
  },
});

const notificationQueue = new Queue("notificationQueue", {
  redis: "redis://127.0.0.1:6379",
  settings: {
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    attempts: 3,
  },
});

// Post Queue Processing
postQueue.process(async (job) => {
  const { postId, platforms } = job.data;
  const errors = [];

  try {
    // Get post data
    const postRef = await db.collection("posts").doc(postId).get();
    if (!postRef.exists) {
      throw new Error("Post not found");
    }
    const post = postRef.data();

    // Get user's tokens
    const userRef = await db.collection("users").doc(post.author).get();
    if (!userRef.exists) {
      throw new Error("User not found");
    }
    const user = userRef.data();

    // Update post status to processing
    await PlatformPublisher.updatePostStatus(postId, "status", "processing");

    // Publish to each platform
    for (const platform of platforms) {
      try {
        await PlatformPublisher.updatePostStatus(
          postId,
          platform,
          "publishing"
        );
        let result;

        switch (platform) {
          case "facebook":
            result = await PlatformPublisher.publishToFacebook(
              post.content,
              user.connectedAccounts.facebook.accessToken
            );
            break;
          case "twitter":
            result = await PlatformPublisher.publishToTwitter(
              post.content,
              user.connectedAccounts.twitter.accessToken,
              user.connectedAccounts.twitter.tokenSecret
            );
            break;
          case "linkedin":
            result = await PlatformPublisher.publishToLinkedIn(
              post.content,
              user.connectedAccounts.linkedin.accessToken
            );
            break;
        }

        await PlatformPublisher.updatePostStatus(
          postId,
          platform,
          "published",
          result.postId
        );
      } catch (error) {
        errors.push({ platform, error: error.message });
        await PlatformPublisher.updatePostStatus(postId, platform, "failed");
      }
    }

    // Create notification for post status
    await createNotificationJob(post.author, postId, Date.now(), {
      title: errors.length
        ? "Post Published with Errors"
        : "Post Published Successfully",
      message: errors.length
        ? `Your post was published with errors on some platforms: ${errors
            .map((e) => e.platform)
            .join(", ")}`
        : "Your post was successfully published to all platforms!",
    });

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }

    return { success: true };
  } catch (error) {
    console.error("Post processing error:", error);
    throw error;
  }
});

// Notification Queue Processing
notificationQueue.process(async (job) => {
  const { userId, postId, message } = job.data;

  try {
    // Get user data
    const userRef = await db.collection("users").doc(userId).get();
    if (!userRef.exists) {
      throw new Error("User not found");
    }
    const user = userRef.data();

    // Get post data
    const postRef = await db.collection("posts").doc(postId).get();
    if (!postRef.exists) {
      throw new Error("Post not found");
    }
    const post = postRef.data();

    // Send notification (e.g., email, push notification)
    console.log(
      `Sending notification to user ${userId} for post ${postId}: ${message}`
    );

    // Update notification status
    await db.collection("notifications").doc(job.id).update({
      status: "sent",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Notification processing error:", error);
    throw error;
  }
});

// Enhanced job management functions
const createPostJob = async (postId, platforms, scheduledTime) => {
  try {
    const job = await postQueue.add(
      { postId, platforms },
      {
        delay: scheduledTime - Date.now(),
        attempts: 5,
        removeOnComplete: false, // Keep job data for history
      }
    );

    await db
      .collection("posts")
      .doc(postId)
      .update({
        "metadata.scheduledTime":
          admin.firestore.Timestamp.fromMillis(scheduledTime),
        "metadata.jobId": job.id,
        status: "scheduled",
      });

    return job;
  } catch (error) {
    console.error("Error creating post job:", error);
    throw error;
  }
};

const cancelPostJob = async (jobId, postId) => {
  try {
    const job = await postQueue.getJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await job.remove();
    await db.collection("posts").doc(postId).update({
      status: "cancelled",
      "metadata.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error canceling post:", error);
    throw error;
  }
};

const reschedulePostJob = async (jobId, postId, newScheduledTime) => {
  try {
    const job = await postQueue.getJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await job.remove();
    const newJob = await createPostJob(
      postId,
      job.data.platforms,
      newScheduledTime
    );

    await db
      .collection("posts")
      .doc(postId)
      .update({
        "metadata.scheduledTime":
          admin.firestore.Timestamp.fromMillis(newScheduledTime),
        "metadata.jobId": newJob.id,
        "metadata.updatedAt": admin.firestore.FieldValue.serverTimestamp(),
      });

    return newJob;
  } catch (error) {
    console.error("Error rescheduling post:", error);
    throw error;
  }
};

const createNotificationJob = async (
  userId,
  postId,
  scheduledTime,
  message
) => {
  try {
    const job = await notificationQueue.add(
      { userId, postId, message },
      {
        delay: scheduledTime - Date.now(),
        attempts: 3,
        removeOnComplete: false, // Keep job data for history
      }
    );

    await db
      .collection("notifications")
      .doc(job.id)
      .set({
        userId,
        postId,
        message,
        scheduledTime: admin.firestore.Timestamp.fromMillis(scheduledTime),
        status: "scheduled",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return job;
  } catch (error) {
    console.error("Error creating notification job:", error);
    throw error;
  }
};

const cancelNotificationJob = async (jobId) => {
  try {
    const job = await notificationQueue.getJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await job.remove();
    await db.collection("notifications").doc(jobId).update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error canceling notification:", error);
    throw error;
  }
};

const rescheduleNotificationJob = async (jobId, newScheduledTime) => {
  try {
    const job = await notificationQueue.getJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await job.remove();
    const newJob = await createNotificationJob(
      job.data.userId,
      job.data.postId,
      newScheduledTime,
      job.data.message
    );

    await db
      .collection("notifications")
      .doc(jobId)
      .update({
        scheduledTime: admin.firestore.Timestamp.fromMillis(newScheduledTime),
        status: "scheduled",
        rescheduledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return newJob;
  } catch (error) {
    console.error("Error rescheduling notification:", error);
    throw error;
  }
};

module.exports = {
  createPostJob,
  cancelPostJob,
  reschedulePostJob,
  createNotificationJob,
  cancelNotificationJob,
  rescheduleNotificationJob,
};
