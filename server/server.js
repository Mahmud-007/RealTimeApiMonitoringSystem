require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { startMonitoring } = require('./services/monitorService');
const path = require('path');

// Import Routes
const logRoutes = require('./routes/logRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        // Start Monitoring Service only after DB is connected
        startMonitoring();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

startServer();

// API Routes
app.use('/api', logRoutes);
app.use('/api/ai', aiRoutes);

// Serve static assets in production
// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
// Match any path that doesn't start with /api using Regex
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
