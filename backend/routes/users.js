const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Camper = require('../models/Camper');
const requireAuth = require('../middleware/requireAuth');

// GET /api/parent/profile - Get the logged-in parent's profile and their campers
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // req.user is attached by the requireAuth middleware
    const parentId = req.user._id;

    // Find the parent's details, excluding the password.
    // .lean() returns a plain JS object for better performance on read-only queries.
    const parentProfile = await User.findById(parentId, '-password').lean();
    if (!parentProfile) {
      return res.status(404).json({ error: 'Parent profile not found.' });
    }

    // Find all campers registered by this parent.
    // Populate the 'session' field to get more session details.
    const registeredCampers = await Camper.find({ parentId })
      .populate({
        path: 'session',
        select: 'name startDate endDate cost', // Fetch more useful session data
      })
      .lean(); // Use .lean() for performance

    res.json({
      profile: parentProfile,
      campers: registeredCampers,
    });

  } catch (err) {
    console.error("Get parent profile error:", err);
    res.status(500).json({ error: 'Failed to fetch profile data.' });
  }
});

module.exports = router;