const { getAuth } = require('../config/firebase');
const { assignRole, createUserWithRole, updateUserRole, getUserClaims } = require('../utils/firebaseRoles');
const User = require('../models/User');
const logger = require('../logger');
const { validationResult } = require('express-validator');

/**
 * Register a new user with Firebase Authentication
 */
exports.firebaseRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors during Firebase registration', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists in MongoDB
    let mongoUser = await User.findOne({ email });
    if (mongoUser) {
      logger.error(`Registration failed: User already exists with email ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }

    try {
      // Create Firebase user with parent role
      const firebaseUser = await createUserWithRole({
        email,
        password,
        role: 'parent',
        displayName: `${firstName} ${lastName}`,
      });

      // Create corresponding MongoDB user for additional data
      mongoUser = new User({
        firstName,
        lastName,
        email,
        password: 'firebase-managed', // Placeholder since Firebase manages auth
        role: 'parent',
        firebaseUid: firebaseUser.uid,
      });

      await mongoUser.save();

      logger.info(`User registered successfully with Firebase: ${email}`);
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: firebaseUser.role,
          firstName,
          lastName,
        },
      });
    } catch (firebaseError) {
      logger.error(`Firebase registration error: ${firebaseError.message}`);
      
      // Handle specific Firebase Auth errors
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email already registered' });
      } else if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({ error: 'Invalid email address' });
      } else if (firebaseError.code === 'auth/weak-password') {
        return res.status(400).json({ error: 'Password is too weak' });
      }
      
      throw firebaseError;
    }
  } catch (error) {
    logger.error(`Error during Firebase registration: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Assign role to a user (Admin/SuperAdmin only)
 */
exports.assignRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors during role assignment', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetUid, role } = req.body;

    // Validate that the requesting user has sufficient permissions
    if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
      logger.warn(`Unauthorized role assignment attempt by user: ${req.user ? req.user.uid : 'Unknown'}`);
      return res.status(403).json({ error: 'Access denied. Admin or SuperAdmin role required.' });
    }

    try {
      const result = await updateUserRole(targetUid, role, req.user);
      
      // Update MongoDB user role as well
      await User.findOneAndUpdate(
        { firebaseUid: targetUid },
        { role },
        { new: true }
      );

      logger.info(`Role '${role}' assigned to user ${targetUid} by ${req.user.uid}`);
      res.json(result);
    } catch (roleError) {
      logger.error(`Role assignment error: ${roleError.message}`);
      
      if (roleError.message.includes('permissions')) {
        return res.status(403).json({ error: roleError.message });
      }
      
      throw roleError;
    }
  } catch (error) {
    logger.error(`Error during role assignment: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get user's custom claims
 */
exports.getUserClaims = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Users can only get their own claims unless they're admin/superadmin
    if (uid !== req.user.uid && !['admin', 'superadmin'].includes(req.user.role)) {
      logger.warn(`Unauthorized claims access attempt by user: ${req.user.uid} for user: ${uid}`);
      return res.status(403).json({ error: 'Access denied.' });
    }

    const claims = await getUserClaims(uid);
    
    logger.info(`Claims retrieved for user ${uid}`);
    res.json({ claims });
  } catch (error) {
    logger.error(`Error retrieving user claims: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get current user profile (Firebase + MongoDB data)
 */
exports.getFirebaseProfile = async (req, res) => {
  try {
    // Get Firebase user data
    const auth = getAuth();
    const firebaseUser = await auth.getUser(req.user.uid);
    
    // Get MongoDB user data
    const mongoUser = await User.findOne({ firebaseUid: req.user.uid }).select('-password');
    
    const profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: req.user.role,
      customClaims: firebaseUser.customClaims || {},
      mongoData: mongoUser || null,
    };

    logger.info(`Profile fetched for Firebase user ${req.user.uid}`);
    res.json(profile);
  } catch (error) {
    logger.error(`Error fetching Firebase profile: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Verify Firebase ID token (for client-side token validation)
 */
exports.verifyToken = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    res.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'parent',
      claims: decodedToken,
    });
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
};

module.exports = {
  firebaseRegister: exports.firebaseRegister,
  assignRole: exports.assignRole,
  getUserClaims: exports.getUserClaims,
  getFirebaseProfile: exports.getFirebaseProfile,
  verifyToken: exports.verifyToken,
};