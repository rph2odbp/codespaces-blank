const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // Define the allowed roles
    enum: ['parent', 'admin', 'superadmin'],
    default: 'parent',
  },
  firstName: String,
  lastName: String,
});

module.exports = mongoose.model('Parents', parentSchema);