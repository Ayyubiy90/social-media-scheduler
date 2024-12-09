import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import { db } from './firebaseConfig.js'; // Import Firebase configuration
import authRoutes from './authRoutes.js'; // Import authentication routes

app.use('/auth', authRoutes); // Set up authentication routes

// Basic route
app.get('/', (req, res) => {
    res.send('Social Media Scheduler Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
