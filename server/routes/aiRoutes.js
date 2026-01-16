const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.chat);
router.get('/incidents', aiController.getIncidents);
router.get('/stats', aiController.getAIStats);

module.exports = router;
