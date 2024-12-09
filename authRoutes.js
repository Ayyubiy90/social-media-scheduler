import express from 'express';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRecord = await getAuth().createUser({
            email,
            password,
        });
        res.status(201).send({ uid: userRecord.uid });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRecord = await getAuth().getUserByEmail(email);
        // Here you would typically verify the password using a custom method
        // For simplicity, we are just returning the user record
        res.status(200).send({ uid: userRecord.uid });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

export default router;
