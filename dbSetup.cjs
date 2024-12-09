const admin = require('firebase-admin');
const db = require('./firebaseConfig.cjs');

// Ensure the necessary collections exist and set up example documents
async function setupCollections() {
  const collections = ['users', 'posts', 'notifications'];

  for (const collection of collections) {
    try {
      await db.collection(collection).get();
      console.log(`Collection ${collection} already exists.`);
    } catch (error) {
      await db.collection(collection).add({});
      console.log(`Collection ${collection} created.`);
    }
  }

  // Set up example documents
  try {
    // Create users collection
    await db.collection('users').doc('exampleUser').set({
      email: 'example@example.com',
      name: 'Example User',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create posts collection
    await db.collection('posts').doc('examplePost').set({
      content: 'This is an example post.',
      author: 'exampleUser',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create notifications collection
    await db.collection('notifications').doc('exampleNotification').set({
      userId: 'exampleUser',
      message: 'You have a new notification.',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Collections set up successfully.');
  } catch (error) {
    console.error('Error setting up collections:', error);
  }
}

module.exports = setupCollections;
