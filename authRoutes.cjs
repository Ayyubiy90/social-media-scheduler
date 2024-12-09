const express = require('express');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

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
    const { email } = req.body; // Removed password handling
    try {
        const userRecord = await getAuth().getUserByEmail(email);
        res.status(200).send({ uid: userRecord.uid });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
