const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebaseConfig.cjs'); // Import Firebase configuration
const Queue = require('bull');
const { DateTime } = require('luxon'); // For handling date and time

const postQueue = new Queue('postQueue'); // Create a new Bull queue for posts

const app = express();
app.use(bodyParser.json());

// Create Users Collection
app.post('/users', async (req, res) => {
    const { email, connectedAccounts } = req.body; // Example fields
    try {
        const userRef = await db.collection('users').add({
            email,
            connectedAccounts,
            createdAt: new Date(),
        });
        res.status(201).send({ id: userRef.id });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: 'Error creating user', details: error.message });
    }
});

// Schedule Post
app.post('/schedule', async (req, res) => {
    const { title, content, userId, scheduledTime, platform } = req.body; // Example fields
    try {
        const job = await postQueue.add({
            title,
            content,
            userId,
            platform,
            scheduledTime: DateTime.fromISO(scheduledTime).toJSDate(), // Convert to Date object
        });
        res.status(201).send({ id: job.id, message: 'Post scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling post:', error);
        res.status(500).send({ error: 'Error scheduling post', details: error.message });
    }
});

// Read Posts by User ID
app.get('/posts/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const postsSnapshot = await db.collection('posts').where('userId', '==', userId).get();
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send({ error: 'Error fetching posts', details: error.message });
    }
});

// Update Post
app.put('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    const { title, content, platform } = req.body; // Fields to update
    const characterLimits = {
        facebook: 63206,
        instagram: 2200,
        twitter: 280,
        linkedin: 3000,
    };

    // Validate post content based on platform
    if (content.length > characterLimits[platform]) {
        return res.status(400).send({ error: `Content exceeds ${characterLimits[platform]} characters for ${platform}.` });
    }
    try {
        await db.collection('posts').doc(postId).update({
            title,
            content,
            updatedAt: new Date(),
        });
        res.status(200).send({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send({ error: 'Error updating post', details: error.message });
    }
});

// Delete Post
app.delete('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        await db.collection('posts').doc(postId).delete();
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send({ error: 'Error deleting post', details: error.message });
    }
});

// Process scheduled posts
postQueue.process(async (job) => {
    const { title, content, userId, platform } = job.data;
    try {
        console.log(`Publishing post to ${platform}: ${title}`);
        await db.collection('posts').add({
            title,
            content,
            userId,
            publishedAt: new Date(),
        });
    } catch (error) {
        console.error('Error publishing post:', error);
        throw new Error('Failed to publish post');
    }
});

// Reschedule Post
app.post('/reschedule/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { scheduledTime } = req.body; // New scheduled time
    try {
        const job = await postQueue.getJob(jobId);
        if (job) {
            await job.update({
                scheduledTime: DateTime.fromISO(scheduledTime).toJSDate(),
            });
            res.status(200).send({ message: 'Post rescheduled successfully' });
        } else {
            res.status(404).send({ error: 'Job not found' });
        }
    } catch (error) {
        console.error('Error rescheduling post:', error);
        res.status(500).send({ error: 'Error rescheduling post', details: error.message });
    }
});

// Cancel Scheduled Post
app.delete('/cancel/:jobId', async (req, res) => {
    const { jobId } = req.params;
    try {
        const job = await postQueue.getJob(jobId);
        if (job) {
            await job.remove();
            res.status(200).send({ message: 'Post scheduling canceled successfully' });
        } else {
            res.status(404).send({ error: 'Job not found' });
        }
    } catch (error) {
        console.error('Error canceling post:', error);
        res.status(500).send({ error: 'Error canceling post', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
