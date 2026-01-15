require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { startMonitoring, pingEndpoint } = require('./services/monitorService');
const eventBus = require('./utils/eventBus');
const Log = require('./models/Log');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Start Monitoring Service
startMonitoring();

// API Endpoints

// Get Historical Logs
app.get('/api/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await Log.find().sort({ timestamp: -1 }).limit(limit);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// SSE Endpoint for Real-time Updates
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendLog = (log) => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
    };

    // Send initial "connected" message (optional)
    // res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    eventBus.on('new-log', sendLog);

    req.on('close', () => {
        eventBus.off('new-log', sendLog);
        res.end();
    });
});

// Manual Trigger Endpoint (for testing/demo)
app.post('/api/trigger', async (req, res) => {
    // This runs the ping logic and emits the event, so clients will see it
    pingEndpoint();
    res.json({ message: 'Ping triggered' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
