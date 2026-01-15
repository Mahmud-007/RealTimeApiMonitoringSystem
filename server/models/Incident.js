const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    type: {
        type: String, // 'latency' | 'error' | 'anomaly'
        required: true
    },
    severity: {
        type: String, // 'low' | 'medium' | 'high'
        default: 'medium'
    },
    description: String,
    affectedEndpoint: String,

    // Auto-analysis fields
    rootCauseAnalysis: String,
    suggestedFix: String,

    // Metadata
    detectedValue: mongoose.Schema.Types.Mixed,
    threshold: String,

    status: {
        type: String, // 'open' | 'investigating' | 'resolved'
        default: 'open'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Incident', IncidentSchema);
