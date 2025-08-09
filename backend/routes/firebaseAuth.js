const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const firebaseAuth = require('../middleware/firebaseAuth');
const { requireAdmin, requireSuperAdmin } = require('../middleware/firebaseRoles');
const firebaseAuthController = require('../controllers/firebaseAuthController');
const logger = require('../logger');
const { emailValidation, passwordValidation } = require('../validators');

const router = express.Router();

// Rate limiter for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many requests, please try again later.' },
});

// Middleware to log route access
router.use((req, res, next) => {
  logger.info(`[Firebase Auth] ${req.method} ${req.originalUrl} accessed`);
  next();
});

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`Validation errors: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Register a new user with Firebase Authentication
 * POST /api/firebase-auth/register
 */
router.post(
  '/register',
  limiter,
  [
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('lastName').notEmpty().withMessage('Last name is required.'),
    emailValidation,
    passwordValidation,
  ],
  handleValidationErrors,
  firebaseAuthController.firebaseRegister
);

/**
 * Assign role to a user (Admin/SuperAdmin only)
 * POST /api/firebase-auth/assign-role
 */
router.post(
  '/assign-role',
  firebaseAuth,
  requireAdmin,
  [
    body('targetUid').notEmpty().withMessage('Target user UID is required.'),
    body('role')
      .isIn(['parent', 'staff', 'admin', 'superadmin'])
      .withMessage('Invalid role. Must be one of: parent, staff, admin, superadmin.'),
  ],
  handleValidationErrors,
  firebaseAuthController.assignRole
);

/**
 * Get user's custom claims
 * GET /api/firebase-auth/claims/:uid
 */
router.get(
  '/claims/:uid',
  firebaseAuth,
  firebaseAuthController.getUserClaims
);

/**
 * Get current user profile (Firebase + MongoDB data)
 * GET /api/firebase-auth/profile
 */
router.get(
  '/profile',
  firebaseAuth,
  firebaseAuthController.getFirebaseProfile
);

/**
 * Verify Firebase ID token
 * POST /api/firebase-auth/verify-token
 */
router.post(
  '/verify-token',
  [
    body('idToken').notEmpty().withMessage('ID token is required.'),
  ],
  handleValidationErrors,
  firebaseAuthController.verifyToken
);

/**
 * Health check for Firebase Auth
 * GET /api/firebase-auth/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Firebase Auth API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;