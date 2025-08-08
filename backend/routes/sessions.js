const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Session = require('../models/Session');
const authMiddleware = require('../middleware/auth'); // Add authentication middleware

// GET /api/sessions - Get all available camp sessions with pagination
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    // Find all sessions, sort by start date, and paginate results
    const sessions = await Session.find()
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get the total count of sessions for pagination metadata
    const total = await Session.countDocuments();

    res.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

// GET /api/sessions/:id - Get a single session's details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Validate the session ID
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid session ID.' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Error fetching single session:', err);
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

module.exports = router;