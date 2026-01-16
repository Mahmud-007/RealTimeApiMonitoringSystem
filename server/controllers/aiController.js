const aiService = require('../services/aiService');
const Incident = require('../models/Incident');
const AICache = require('../models/AICache');
const AIUsage = require('../models/AIUsage');

const aiController = {
    // Chat Endpoint
    chat: async (req, res) => {
        try {
            const { prompt } = req.body;
            if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

            const result = await aiService.generateResponse(prompt);
            res.json(result);
        } catch (err) {
            console.error('AI Chat Error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Get Incidents
    getIncidents: async (req, res) => {
        try {
            const incidents = await Incident.find().sort({ timestamp: -1 });
            res.json(incidents);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch incidents' });
        }
    },

    // Get AI Statistics
    getAIStats: async (req, res) => {
        try {
            const stats = await AIUsage.aggregate([
                {
                    $group: {
                        _id: null,
                        totalInputTokens: { $sum: '$inputTokens' },
                        totalOutputTokens: { $sum: '$outputTokens' },
                        totalRequests: { $sum: 1 }
                    }
                }
            ]);

            if (stats.length === 0) {
                return res.json({ totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, totalRequests: 0 });
            }

            const { totalInputTokens, totalOutputTokens, totalRequests } = stats[0];

            // Calculate cost logic (same as Service)
            const inputCost = (totalInputTokens / 1000000) * 0.075;
            const outputCost = (totalOutputTokens / 1000000) * 0.30;
            const totalCost = parseFloat((inputCost + outputCost).toFixed(4));

            res.json({
                totalInputTokens,
                totalOutputTokens,
                totalCost,
                totalRequests
            });
        } catch (err) {
            console.error('AI Stats Error:', err);
            res.status(500).json({ error: 'Failed to fetch AI stats' });
        }
    }
};

module.exports = aiController;
