const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Camper = require('../models/Camper');
const User = require('../models/User');

const isParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ error: 'Access denied. Parent role required.' });
  }
  next();
};

router.get('/profile', authMiddleware, isParent, async (req, res) => {
  try {
    const parent = await User.findById(req.user.userId).select('-password');
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found.' });
    }
    res.json(parent);
  } catch (err) {
    console.error(err.message);
    // FIX: Send JSON error response
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/my-campers', authMiddleware, isParent, async (req, res) => {
  try {
    const campers = await Camper.find({ parentId: req.user.userId }).populate('session', 'name cost');
    res.json(campers);
  } catch (err) {
    console.error(err.message);
    // FIX: Send JSON error response
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;