const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken.exp < Date.now() / 1000) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            // Adding any other user info you want to pass to routes
        };
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

const verifySession = async (req, res, next) => {
    const { uid } = req.user;
    try {
        const userRecord = await admin.auth().getUser(uid);
        if (userRecord.disabled) {
            return res.status(401).json({ error: 'User account is disabled' });
        }
        next();
    } catch (error) {
        console.error('Error verifying session:', error);
        res.status(401).json({ error: 'Invalid session' });
    }
};

module.exports = { verifyToken, verifySession };
