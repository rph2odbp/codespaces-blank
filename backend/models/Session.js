const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 0,
  },
  registeredCampers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camper',
  }],
  waitlistedCampers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camper',
  }],
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

// A virtual property to calculate remaining spots
sessionSchema.virtual('spotsRemaining').get(function() {
  return this.capacity - this.registeredCampers.length;
});

module.exports = mongoose.model('Session', sessionSchema);