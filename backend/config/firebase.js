const admin = require('firebase-admin');
const logger = require('../logger');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
      // For development, use service account key file
      // In production, this should be set via environment variables
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : null;

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        logger.info('Firebase Admin SDK initialized with service account');
      } else {
        // For development with emulators or default credentials
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
          databaseURL: process.env.FIREBASE_DATABASE_URL || 'http://localhost:9000/?ns=demo-project',
        });
        logger.info('Firebase Admin SDK initialized with default credentials');
      }
    } else {
      logger.info('Firebase Admin SDK already initialized');
    }

    return admin;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Get Firebase Auth instance
const getAuth = () => {
  return admin.auth();
};

// Get Firebase Database instance
const getDatabase = () => {
  return admin.database();
};

module.exports = {
  initializeFirebase,
  getAuth,
  getDatabase,
  admin,
};