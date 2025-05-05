const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: String,
  streamKey: String,
  userId: String,
  isLive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stream', streamSchema);
