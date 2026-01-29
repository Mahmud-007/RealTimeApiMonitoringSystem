const cron = require('node-cron');
const axios = require('axios');
const crypto = require('crypto');
const Log = require('../models/Log');
const eventBus = require('../utils/eventBus');
const { performance } = require('perf_hooks');

const HTTPBIN_URL = 'https://httpbin.org/anything';

const generatePayload = () => {
    const types = ['purchase', 'login', 'logout', 'view_page', 'add_to_cart'];
    return {
        eventId: crypto.randomUUID(),
        type: types[Math.floor(Math.random() * types.length)],
        value: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
    };
};

const pingEndpoint = async () => {
    const payload = generatePayload();
    const start = performance.now();
    let status = 0;
    let responseRaw = null;
    let errorOccurred = false;

    try {
        const response = await axios.post(HTTPBIN_URL, payload);
        status = response.status;
        responseRaw = response.data;
    } catch (error) {
        errorOccurred = true;
        if (error.response) {
            status = error.response.status;
            responseRaw = error.response.data;
        } else {
            status = 500; // System error/Network error
            responseRaw = { error: error.message };
        }
    }

    const end = performance.now();
    const latencyMs = Math.round((end - start) * 100) / 100; // 2 decimal places

    const newLog = new Log({
        status,
        latencyMs,
        requestPayload: payload,
        responseRaw,
        method: 'POST',
        origin: 'monitor-service'
    });

    try {
        const savedLog = await newLog.save();
        console.log(`[Monitor] Ping successful: ${status} in ${latencyMs}ms`);
        eventBus.emit('new-log', savedLog);
        detectAnomalies(savedLog);
    } catch (dbError) {
        console.error('[Monitor] Failed to save log:', dbError);
    }
};

const startMonitoring = () => {
    console.log('[Monitor] Starting monitoring service...');
    // Schedule task to run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        console.log('[Monitor] Triggering scheduled ping...');
        pingEndpoint();
    });

    // Optional: Trigger one immediately for verification on startup?
    // pingEndpoint(); 
};

// Also export the simple ping function for creating a "Trigger Now" button or testing
module.exports = { startMonitoring, pingEndpoint, generatePayload }; // Export generatePayload for testing
