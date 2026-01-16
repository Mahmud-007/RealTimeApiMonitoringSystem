const mongoose = require('mongoose');

const AIUsageSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    inputTokens: {
        type: Number,
        required: true
    },
    outputTokens: {
        type: Number,
        required: true
    },
    model: {
        type: String,
        default: 'gemini-1.5-flash'
    },
    type: {
        type: String,
        enum: ['chat', 'incident_analysis'],
        default: 'chat'
    }
});

module.exports = mongoose.model('AIUsage', AIUsageSchema);
