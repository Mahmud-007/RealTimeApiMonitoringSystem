const request = require('supertest');
const express = require('express');

// Mock `@google/generative-ai` virtually
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn()
    }))
}), { virtual: true });

// Mock Models
jest.mock('../../models/Log', () => ({
    aggregate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn()
}));
jest.mock('../../models/AIUsage', () => ({
    aggregate: jest.fn(),
    create: jest.fn()
}));
jest.mock('../../models/AICache', () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));
jest.mock('../../models/Incident', () => ({
    find: jest.fn(),
    create: jest.fn()
}));

const Log = require('../../models/Log');
const AIUsage = require('../../models/AIUsage');

const logRoutes = require('../../routes/logRoutes');
const aiRoutes = require('../../routes/aiRoutes');

const app = express();
app.use(express.json());
app.use('/api', logRoutes);
app.use('/api/ai', aiRoutes);

describe('API Integration Tests', () => {

    describe('GET /api/stats', () => {
        test('should return aggregated stats correctly', async () => {
            Log.aggregate.mockResolvedValue([
                {
                    totalLogs: 10,
                    avgLatency: 250,
                    successCount: 8
                }
            ]);

            const res = await request(app).get('/api/stats');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('totalLogs', 10);
            expect(res.body).toHaveProperty('avgLatency', 250);
            expect(res.body).toHaveProperty('successRate', 80);
        });
    });

    describe('GET /api/ai/stats', () => {
        test('should return AI usage stats correctly', async () => {
            AIUsage.aggregate.mockResolvedValue([
                {
                    totalInputTokens: 1000,
                    totalOutputTokens: 500,
                    totalRequests: 2
                }
            ]);

            const res = await request(app).get('/api/ai/stats');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('totalInputTokens', 1000);
            expect(res.body).toHaveProperty('totalOutputTokens', 500);
            expect(res.body).toHaveProperty('totalCost');
        });
    });
});
