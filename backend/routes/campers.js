const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Camper = require('../models/Camper');
const Session = require('../models/Session');

router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, session, medical } = req.body;
    const parentId = req.user.userId;

    const campSession = await Session.findById(session);
    if (!campSession) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const newCamper = new Camper({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      parentId,
      session,
      medical,
    });

    await newCamper.save();
    res.status(201).json(newCamper);
  } catch (err) {
    console.error(err.message);
    // FIX: Send JSON error response
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const camper = await Camper.findById(req.params.id).populate('session');
    if (!camper) {
      return res.status(404).json({ error: 'Camper not found.' });
    }
    res.json(camper);
  } catch (err) {
    console.error(err.message);
    // FIX: Send JSON error response
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/:id/pay-deposit', authMiddleware, async (req, res) => {
  try {
    const camper = await Camper.findById(req.params.id);
    if (!camper) {
      return res.status(404).json({ error: 'Camper not found.' });
    }
    camper.paymentStatus = 'paid_in_full'; // Simplified for now
    await camper.save();
    res.json({ msg: 'Deposit paid successfully', camper });
  } catch (err) {
    console.error(err.message);
    // FIX: Send JSON error response
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;