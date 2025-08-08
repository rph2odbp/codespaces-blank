const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  parentEmail: String,
  text: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);