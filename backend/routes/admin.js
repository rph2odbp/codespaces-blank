const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const Camper = require('../models/Camper');
const Session = require('../models/Session');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// --- User Management Routes ---

// Deactivate a user (superadmin only)
router.patch('/users/:id/deactivate', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { deactivated: true } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Deactivate user error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Reactivate a user (superadmin only)
router.patch('/users/:id/activate', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { deactivated: false } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Reactivate user error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete a user (superadmin only)
router.delete('/users/:id', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Change a user's role (superadmin only)
router.patch(
  '/users/:id/role',
  authMiddleware,
  requireSuperAdmin,
  [
    body('role').isIn(['parent', 'staff', 'admin', 'superadmin']).withMessage('Invalid role.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { role } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error('Change user role error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

// Get all users (superadmin only)
router.get('/users', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Camper Management Routes ---

// Get a list of all campers with filtering
router.get('/campers', authMiddleware, requireAdmin, async (req, res) => {
  const { session, status, registrationStatus, cabin } = req.query;
  const filter = {};
  if (session) filter.session = session;
  if (status) filter.status = status;
  if (registrationStatus) filter.registrationStatus = registrationStatus;
  if (cabin) filter.cabin = cabin;
  try {
    const campers = await Camper.find(filter)
      .populate('session', 'name')
      .populate('parentId', 'email');
    res.json({ success: true, data: campers });
  } catch (err) {
    console.error('Get campers error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Assign or move a camper to a session
router.patch('/campers/:id/session', authMiddleware, requireAdmin, async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });
  try {
    const camper = await Camper.findByIdAndUpdate(
      req.params.id,
      { session: sessionId },
      { new: true }
    ).populate('session', 'name');
    if (!camper) return res.status(404).json({ error: 'Camper not found.' });
    res.json({ success: true, data: camper });
  } catch (err) {
    console.error('Assign session error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Session Management Routes ---

// Create a new session
router.post(
  '/sessions',
  authMiddleware,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required.'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date.'),
    body('endDate').isISO8601().withMessage('End date must be a valid date.'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer.'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, startDate, endDate, capacity, cost } = req.body;
      const newSession = new Session({ name, startDate, endDate, capacity, cost });
      await newSession.save();
      res.status(201).json({ success: true, data: newSession });
    } catch (err) {
      console.error('Create session error:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

// List all sessions
router.get('/sessions', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startDate: 1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update a session
router.put('/sessions/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, startDate, endDate, capacity, cost } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { name, startDate, endDate, capacity, cost },
      { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete a session (only if no campers are registered)
router.delete('/sessions/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    const campersInSession = await Camper.countDocuments({ session: req.params.id });
    if (campersInSession > 0) {
      return res.status(400).json({ error: 'Cannot delete session with registered campers.' });
    }
    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted successfully.' });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;