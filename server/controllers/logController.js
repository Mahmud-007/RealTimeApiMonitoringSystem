const Log = require('../models/Log');
const eventBus = require('../utils/eventBus');
const { pingEndpoint } = require('../services/monitorService');

const logController = {
    // Get Historical Logs with Pagination and Filtering
    getLogs: async (req, res) => {
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

            // Status Filtering
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
    },

    // SSE Endpoint for Real-time Updates
    subscribeEvents: (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendLog = (log) => {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
        };

        eventBus.on('new-log', sendLog);

        req.on('close', () => {
            eventBus.off('new-log', sendLog);
            res.end();
        });
    },

    // Manual Trigger Endpoint
    triggerPing: async (req, res) => {
        pingEndpoint();
        res.json({ message: 'Ping triggered' });
    }
};

module.exports = logController;
