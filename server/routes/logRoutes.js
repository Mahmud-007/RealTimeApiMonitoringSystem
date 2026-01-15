const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Get logs (with pagination/filters)
router.get('/logs', logController.getLogs);

// Get overall statistics
router.get('/stats', logController.getStats);

// Real-time events
router.get('/events', logController.subscribeEvents);

// Manual trigger
router.post('/trigger', logController.triggerPing);

module.exports = router;
