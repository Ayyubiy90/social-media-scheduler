import admin from 'firebase-admin';
import serviceAccount from './path/to/your/serviceAccountKey.json'; // Update with the correct path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<your-database-name>.firebaseio.com' // Update with your database URL
});

export const db = admin.firestore(); // Use Firestore or Realtime Database as needed
