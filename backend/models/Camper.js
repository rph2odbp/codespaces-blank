const mongoose = require('mongoose');

const camperSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required.'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required.'],
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  status: {
    type: String,
    enum: ['active', 'waitlist'],
    default: 'active',
  },
  registrationStatus: {
    type: String,
    enum: ['complete', 'pending'],
    default: 'pending',
  },
  cabin: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  medicalInfo: {
    type: String,
    trim: true,
  },
  allergies: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relation: { type: String, trim: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Camper', camperSchema);