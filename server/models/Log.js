const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  latencyMs: {
    type: Number,
    required: true
  },
  requestPayload: {
    type: Object,
    required: true
  },
  responseRaw: {
    type: Object
  },
  method: {
    type: String,
    default: 'POST'
  },
  origin: {
    type: String,
    default: 'cron-job'
  }
});

module.exports = mongoose.model('Log', logSchema);
