const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../logger');
const { validationResult } = require('express-validator');

/**
 * Assign a new password to a user (Superadmin only)
 */
exports.assignPassword = async (email, newPassword) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Assign password failed: User not found with email ${email}`);
      return null;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info(`Password updated successfully for user: ${email}`);
    return user;
  } catch (error) {
    logger.error(`Error assigning password: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors during registration', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      logger.error(`Registration failed: User already exists with email ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'parent',
    });

    await user.save();

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ token, user: { id: user.id, firstName: user.firstName, role: user.role } });
  } catch (error) {
    logger.error(`Error during registration: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Login a user
 */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors during login', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.error(`Login failed: Invalid credentials for email ${email}`);
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    logger.info(`User logged in successfully: ${email}`);
    res.json({ token, user: { id: user.id, firstName: user.firstName, role: user.role } });
  } catch (error) {
    logger.error(`Error during login: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Upload user avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      logger.error('Avatar upload failed: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar: `/uploads/avatars/${req.file.filename}` },
      { new: true }
    ).select('-password');

    logger.info(`Avatar uploaded successfully for user ${req.user.userId}`);
    res.json({ avatar: user.avatar });
  } catch (error) {
    logger.error(`Error during avatar upload: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Set a new password
 */
exports.setPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors during set password', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, token, password } = req.body;

    const user = await User.findOne({ email, passwordToken: token });
    if (!user || user.passwordTokenExpires < Date.now()) {
      logger.error(`Set password failed: Invalid or expired token for email ${email}`);
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordToken = undefined;
    user.passwordTokenExpires = undefined;
    await user.save();

    logger.info(`Password set successfully for user ${email}`);
    res.json({ msg: 'Password set successfully. You can now log in.' });
  } catch (error) {
    logger.error(`Error during set password: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get the current user's profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    logger.info(`Profile fetched successfully for user ${req.user.userId}`);
    res.json(user);
  } catch (error) {
    logger.error(`Error fetching profile: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Update the current user's profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    logger.info(`Profile updated successfully for user ${req.user.userId}`);
    res.json(user);
  } catch (error) {
    logger.error(`Error updating profile: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Change the user's password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      logger.error(`Change password failed: Incorrect current password for user ${req.user.userId}`);
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logger.info(`Password changed successfully for user ${req.user.userId}`);
    res.json({ msg: 'Password changed successfully.' });
  } catch (error) {
    logger.error(`Error during change password: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Request a password reset
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`Password reset request failed: User not found with email ${email}`);
      return res.status(400).json({ error: 'User not found.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordToken = token;
    user.passwordTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    logger.info(`Password reset token generated for ${email}: ${token}`);
    res.json({ msg: 'Password reset link sent to your email.' });
  } catch (error) {
    logger.error(`Error during password reset request: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};