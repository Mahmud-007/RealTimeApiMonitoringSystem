const { GoogleGenerativeAI } = require('@google/generative-ai');
const AICache = require('../models/AICache');
const Incident = require('../models/Incident');

// Rate Limiting Config
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_CALLS_PER_WINDOW = 50;

let callCount = 0;
let windowStart = Date.now();

const checkRateLimit = () => {
    const now = Date.now();
    if (now - windowStart > RATE_LIMIT_WINDOW) {
        callCount = 0;
        windowStart = now;
    }
    return callCount < MAX_CALLS_PER_WINDOW;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

const estimateCost = (inputTokens, outputTokens) => {
    return 0;
};

const aiService = {
    generateResponse: async (prompt, systemContext = "You are a helpful monitoring assistant.") => {
        if (!checkRateLimit()) {
            throw new Error('Rate limit exceeded.');
        }

        const promptHash = Buffer.from(prompt + systemContext).toString('base64');
        const cached = await AICache.findOne({ promptHash });

        if (cached) {
            console.log('[AI] Cache Hit');
            return { text: cached.response, cached: true };
        }

        console.log('[AI] Calling Gemini...');
        if (!process.env.GEMINI_API_KEY) {
            callCount++;
            return { text: "[MOCK] Gemini Key missing. This is a simulated response.", cached: false };
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const fullPrompt = `${systemContext}\n\nUser: ${prompt}`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const responseText = response.text();

            callCount++;

            const inputTokens = fullPrompt.length / 4;
            const outputTokens = responseText.length / 4;

            await AICache.create({
                promptHash,
                originalQuery: prompt.substring(0, 200),
                response: responseText,
                tokensUsed: Math.ceil(inputTokens + outputTokens),
                costUSD: estimateCost()
            });

            return { text: responseText, cached: false, cost: 0 };

        } catch (error) {
            console.error('[AI] Gemini Error:', error);
            throw new Error(`Failed to generate AI response: ${error.message}`);
        }
    },

    detectAnomalies: async (log) => {
        const isHighLatency = log.latencyMs > 2000;
        const isServerError = log.status >= 500;

        if (isHighLatency || isServerError) {
            const type = isHighLatency ? 'latency' : 'error';
            const description = isHighLatency
                ? `High latency detected: ${log.latencyMs}ms`
                : `Server error detected: ${log.status}`;

            console.log(`[AI] Anomaly detected: ${description}`);

            const incident = await Incident.create({
                type,
                severity: isServerError ? 'high' : 'medium',
                description,
                affectedEndpoint: 'httpbin.org/anything',
                detectedValue: isHighLatency ? log.latencyMs : log.status,
                threshold: isHighLatency ? '> 2000ms' : '>= 500',
                status: 'open'
            });

            aiService.analyzeIncident(incident, log);
        }
    },

    analyzeIncident: async (incident, log) => {
        try {
            const prompt = `Analyze this API monitoring incident:
            Type: ${incident.type}
            Description: ${incident.description}
            Full Log Header: ${JSON.stringify(log.responseHeaders)}
            
            Provide a brief Root Cause Analysis and a Suggested Fix. Return JSON format: { "rootCause": "...", "fix": "..." }`;

            const { text } = await aiService.generateResponse(prompt, "You are a Site Reliability Engineer.");

            try {
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const analysis = JSON.parse(jsonStr);

                incident.rootCauseAnalysis = analysis.rootCause;
                incident.suggestedFix = analysis.fix;
                incident.status = 'investigating';
                await incident.save();
                console.log('[AI] Incident analyzed and updated');
            } catch (e) {
                console.warn('[AI] Failed to parse analysis JSON', e);
                incident.rootCauseAnalysis = text;
                await incident.save();
            }

        } catch (err) {
            console.error('[AI] Incident analysis failed:', err);
        }
    }
};

module.exports = aiService;
