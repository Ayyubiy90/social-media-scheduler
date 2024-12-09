const Queue = require('bull');
const redis = require('redis');

const redisClient = redis.createClient({
    url: 'redis://127.0.0.1:6379',
});

redisClient.on('error', (error) => {
    console.error('Redis error:', error);
});

const postQueue = new Queue('postQueue', 'redis://127.0.0.1:6379');
const notificationQueue = new Queue('notificationQueue', 'redis://127.0.0.1:6379');

postQueue.process(async (job, done) => {
    const { platform, content, scheduledTime } = job.data;
    try {
        // Implement the logic to publish the post to the specified platform
        console.log(`Publishing post to ${platform} at ${scheduledTime}: ${content}`);
        done();
    } catch (error) {
        done(new Error('Failed to publish post'));
    }
});

notificationQueue.process(async (job, done) => {
    const { userId, postId, scheduledTime } = job.data;
    try {
        // Implement the logic to send a notification to the user
        console.log(`Sending notification to user ${userId} for post ${postId} at ${scheduledTime}`);
        done();
    } catch (error) {
        done(new Error('Failed to send notification'));
    }
});

const createPostJob = (platform, content, scheduledTime) => {
    return postQueue.add({ platform, content, scheduledTime }, { delay: scheduledTime - Date.now() });
};

const cancelPostJob = async (jobId) => {
    try {
        const job = await postQueue.getJob(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        await job.remove();
        return true;
    } catch (error) {
        console.error('Error canceling post:', error);
        throw error;
    }
};

const reschedulePostJob = (jobId, newScheduledTime) => {
    return postQueue.updateJob(jobId, { scheduledTime: newScheduledTime }, { delay: newScheduledTime - Date.now() });
};

const createNotificationJob = (userId, postId, scheduledTime) => {
    return notificationQueue.add({ userId, postId, scheduledTime }, { delay: scheduledTime - Date.now() });
};

const cancelNotificationJob = async (jobId) => {
    try {
        const job = await notificationQueue.getJob(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        await job.remove();
        return true;
    } catch (error) {
        console.error('Error canceling notification:', error);
        throw error;
    }
};

const rescheduleNotificationJob = (jobId, newScheduledTime) => {
    return notificationQueue.updateJob(jobId, { scheduledTime: newScheduledTime }, { delay: newScheduledTime - Date.now() });
};

module.exports = {
    createPostJob,
    cancelPostJob,
    reschedulePostJob,
    createNotificationJob,
    cancelNotificationJob,
    rescheduleNotificationJob,
};
