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
        console.error('Error creating user:', error); // Log the error
        res.status(500).send({ error: 'Error creating user', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
