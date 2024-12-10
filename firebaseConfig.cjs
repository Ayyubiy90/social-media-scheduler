const admin = require('firebase-admin');
const serviceAccount = require('./backend/admin/serviceAccountKey.json'); // Updated path to service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-media-scheduler-9a3ad.firebaseio.com" // Update with your database URL
});

const db = admin.firestore();

module.exports = db;
