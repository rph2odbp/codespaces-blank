const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const authController = require('../controllers/authController');
const logger = require('../logger'); // Import logger
const { emailValidation, passwordValidation } = require('../validators'); // Reusable validators
const User = require('../models/User'); // Import User model for direct database queries
const jwt = require('jsonwebtoken');

const router = express.Router();

// Rate limiter for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many requests, please try again later.' },
});

// Middleware to log route access
router.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.originalUrl} accessed`);
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

// Helper function to generate JWT
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in the environment variables.');
    throw new Error('JWT_SECRET is missing.');
  }
  return jwt.sign({ user: { id: userId, role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Routes
/**
 * Login a user
 */
router.post(
  '/login',
  limiter,
  [
    emailValidation, // Validate email format
    passwordValidation, // Ensure password is provided
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password'); // Include password in query
      if (!user) {
        logger.warn(`Login failed: No user found with email ${email}`);
        return res.status(400).json({ error: 'Invalid credentials.' });
      }

      // Compare passwords
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn(`Login failed: Incorrect password for email ${email}`);
        return res.status(400).json({ error: 'Invalid credentials.' });
      }

      // Generate JWT
      const token = generateToken(user.id, user.role);
      logger.info(`User logged in successfully: ${email}`);
      res.json({ token });
    } catch (err) {
      logger.error(`Server error during login: ${err.message}`, { stack: err.stack });
      res.status(500).send('Server error');
    }
  })
);

/**
 * Register a new user
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
  asyncHandler(authController.register)
);

/**
 * Assign a new password (Superadmin only)
 */
router.post(
  '/assign-password',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;

    if (!req.user || req.user.role !== 'superadmin') {
      logger.warn(`Unauthorized access attempt by user: ${req.user ? req.user.id : 'Unknown'}`);
      return res.status(403).json({ error: 'Access denied. Only superadmins can assign passwords.' });
    }

    if (!email || !newPassword) {
      logger.error('Email and new password are required.');
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      logger.error('New password must be at least 6 characters long.');
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`User not found with email: ${email}`);
      return res.status(404).json({ error: 'User not found.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logger.info(`Superadmin ${req.user.id} assigned a new password to user: ${email}`);
    res.status(200).json({ message: 'Password updated successfully.' });
  })
);

/**
 * Other routes
 */
router.post('/avatar', authMiddleware, asyncHandler(authController.uploadAvatar));
router.post(
  '/set-password',
  [
    emailValidation,
    body('token').notEmpty().withMessage('Token is required.'),
    passwordValidation,
  ],
  handleValidationErrors,
  asyncHandler(authController.setPassword)
);
router.get('/me', authMiddleware, asyncHandler(authController.getProfile));
router.put(
  '/me',
  authMiddleware,
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty.'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty.'),
    emailValidation.optional(),
  ],
  handleValidationErrors,
  asyncHandler(authController.updateProfile)
);
router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    passwordValidation,
  ],
  handleValidationErrors,
  asyncHandler(authController.changePassword)
);
router.post(
  '/request-password-reset',
  limiter,
  [emailValidation],
  handleValidationErrors,
  asyncHandler(authController.requestPasswordReset)
);

module.exports = router;