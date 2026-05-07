const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK using Application Default Credentials
// For local development, we use a service account key file.
// The GOOGLE_APPLICATION_CREDENTIALS env variable can also be used.
let serviceAccount;

try {
  serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
} catch (err) {
  // If no service account file, try to initialize without it (for production / cloud environments)
  serviceAccount = null;
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'student-performance-anal-dbe93',
  });
} else {
  admin.initializeApp({
    projectId: 'student-performance-anal-dbe93',
  });
}

const db = admin.firestore();

module.exports = { admin, db };
