const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebaseConfig.cjs'); // Import Firebase configuration

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

// Create Post
app.post('/posts', async (req, res) => {
    const { title, content, userId } = req.body; // Example fields
    try {
        const postRef = await db.collection('posts').add({
            title,
            content,
            userId,
            createdAt: new Date(),
        });
        res.status(201).send({ id: postRef.id });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send({ error: 'Error creating post', details: error.message });
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
