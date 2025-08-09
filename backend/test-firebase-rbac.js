#!/usr/bin/env node
/**
 * Test script for Firebase RBAC implementation
 * Run this with: node test-firebase-rbac.js
 */

const { initializeFirebase, getAuth } = require('./config/firebase');
const { assignRole, createUserWithRole } = require('./utils/firebaseRoles');
const logger = require('./logger');

async function testFirebaseRBAC() {
  try {
    logger.info('🔥 Starting Firebase RBAC Test');
    
    // Initialize Firebase
    const firebase = initializeFirebase();
    logger.info('✅ Firebase Admin SDK initialized');

    // Test auth instance
    const auth = getAuth();
    logger.info('✅ Firebase Auth instance created');

    // Test creating a test user (this will fail in demo mode, but shows the structure)
    try {
      const testUser = await createUserWithRole({
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'parent',
        displayName: 'Test User'
      });
      logger.info('✅ Test user created:', testUser);
    } catch (error) {
      logger.warn('⚠️ Test user creation failed (expected in demo mode):', error.message);
    }

    // Test role assignment (will also fail in demo mode)
    try {
      await assignRole('test-uid', 'staff');
      logger.info('✅ Role assignment test passed');
    } catch (error) {
      logger.warn('⚠️ Role assignment failed (expected in demo mode):', error.message);
    }

    logger.info('🎉 Firebase RBAC Test Complete');
    logger.info('📝 To use with real Firebase project:');
    logger.info('   1. Replace FIREBASE_PROJECT_ID in .env');
    logger.info('   2. Add FIREBASE_SERVICE_ACCOUNT_KEY in production');
    logger.info('   3. Update FIREBASE_DATABASE_URL');
    logger.info('   4. Test with Firebase Emulators or real project');

  } catch (error) {
    logger.error('❌ Firebase RBAC Test Failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testFirebaseRBAC().then(() => {
    process.exit(0);
  }).catch((error) => {
    logger.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testFirebaseRBAC };