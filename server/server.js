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
// Get Historical Logs with Pagination and Filtering
app.get('/api/logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const { startDate, endDate, status } = req.query;
        let query = {};

        // Date Filtering
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Status Filtering (e.g., status=200 or status=error for >= 400)
        if (status) {
            if (status === 'error') {
                query.status = { $gte: 400 };
            } else if (status === 'success') {
                query.status = { $lt: 400 };
            } else {
                query.status = parseInt(status);
            }
        }

        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Log.countDocuments(query);

        res.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching logs:', err);
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

// Serve static assets in production
const path = require('path');
// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
