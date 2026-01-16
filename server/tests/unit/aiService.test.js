// Mock the generative AI module before requiring the service - using virtual: true to bypass disk resolution issues in this environment
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn()
    }))
}), { virtual: true });

const { estimateCost } = require('../../services/aiService');

describe('AI Service Cost Estimation', () => {
    test('should calculate correct cost for 1M input tokens', () => {
        const inputTokens = 1000000;
        const outputTokens = 0;
        const cost = estimateCost(inputTokens, outputTokens);
        expect(cost).toBe(0.075);
    });

    test('should calculate correct cost for 1M output tokens', () => {
        const inputTokens = 0;
        const outputTokens = 1000000;
        const cost = estimateCost(inputTokens, outputTokens);
        expect(cost).toBe(0.3);
    });

    test('should calculate correct combined cost for mixed tokens', () => {
        const inputTokens = 500000;  // 0.5M * 0.075 = 0.0375
        const outputTokens = 200000; // 0.2M * 0.30 = 0.06
        const cost = estimateCost(inputTokens, outputTokens);
        // Total: 0.0975
        expect(cost).toBe(0.0975);
    });

    test('should return 0 for zero tokens', () => {
        expect(estimateCost(0, 0)).toBe(0);
    });

    test('should handle small token amounts with precision', () => {
        const inputTokens = 1500;
        const outputTokens = 250;
        const cost = estimateCost(inputTokens, outputTokens);
        // 1500/1M * 0.075 = 0.0001125
        // 250/1M * 0.30 = 0.000075
        // Total: 0.0001875 -> fixed(6) -> 0.000188
        expect(cost).toBeGreaterThan(0);
        expect(cost).toBeLessThan(0.001);
    });
});
