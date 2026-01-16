const mongoose = require('mongoose');

const AICacheSchema = new mongoose.Schema({
    promptHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    originalQuery: String,
    response: {
        type: String,
        required: true
    },
    inputTokens: {
        type: Number,
        default: 0
    },
    outputTokens: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // Expire after 7 days
    }
});

module.exports = mongoose.model('AICache', AICacheSchema);
