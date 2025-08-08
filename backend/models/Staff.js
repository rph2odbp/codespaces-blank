const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  position: String,
  applicationDate: Date,
});

module.exports = mongoose.model('Staff', staffSchema);