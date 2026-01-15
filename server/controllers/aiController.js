const aiService = require('../services/aiService');
const Incident = require('../models/Incident');

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
    }
};

module.exports = aiController;
