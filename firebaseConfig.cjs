const admin = require('firebase-admin');
const serviceAccount = require('./backend/admin/serviceAccountKey.json'); // Use require to load the service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<your-database-name>.firebaseio.com' // Update with your database URL
});

const db = admin.firestore(); // Use Firestore or Realtime Database as needed

module.exports = { db };
