const { GoogleGenerativeAI } = require('@google/generative-ai');
const AICache = require('../models/AICache');
const AIUsage = require('../models/AIUsage');
const Incident = require('../models/Incident');
const Log = require('../models/Log');

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
    // Gemini 1.5 Flash Pricing (approximate)
    // Input: $0.075 / 1M tokens
    // Output: $0.30 / 1M tokens
    const inputCost = (inputTokens / 1000000) * 0.075;
    const outputCost = (outputTokens / 1000000) * 0.30;
    return parseFloat((inputCost + outputCost).toFixed(6));
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

            // 1. Intent Analysis & Query Generation
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const queryPrompt = `You are a MongoDB Query Generator for a log monitoring system.

Database Schema:
- Collection: 'logs'
- Fields:
  * timestamp (Date) - when the request occurred
  * status (Number) - HTTP status code (200, 404, 500, etc.)
  * latencyMs (Number) - response time in milliseconds
  * method (String) - HTTP method
  * requestPayload (Object)

CRITICAL RULES:
1. ALWAYS generate a query if the user asks about logs, errors, performance, issues, or system data
2. For "today": use timestamp >= "${today.toISOString()}"
3. For "last 24 hours": use timestamp >= "${last24h.toISOString()}"
4. For "issues" or "errors": query status >= 400
5. For "slow" or "performance": sort by latencyMs descending
6. Output ONLY valid JSON: { "type": "find", "query": {...}, "sort": {...}, "limit": N }
7. Default limit: 10. Max limit: 20
8. Return null ONLY for greetings like "hello" or "hi"

Examples:
- "Summarize issues in last 24 hours" → { "type": "find", "query": { "timestamp": { "$gte": "${last24h.toISOString()}" }, "status": { "$gte": 400 } }, "sort": { "timestamp": -1 }, "limit": 20 }
- "Slowest response times today" → { "type": "find", "query": { "timestamp": { "$gte": "${today.toISOString()}" } }, "sort": { "latencyMs": -1 }, "limit": 10 }
- "What errors occurred?" → { "type": "find", "query": { "status": { "$gte": 400 } }, "sort": { "timestamp": -1 }, "limit": 10 }

User Question: "${prompt}"

Generate the MongoDB query now:`;

            const queryResult = await model.generateContent(queryPrompt);
            const queryText = await queryResult.response.text();
            let dbData = null;
            let dbQuery = null;

            try {
                const jsonStr = queryText.replace(/```json/g, '').replace(/```/g, '').trim();
                dbQuery = JSON.parse(jsonStr);

                if (dbQuery && dbQuery.type === 'find') {
                    console.log('[AI] Executing Generated Query:', JSON.stringify(dbQuery));

                    let query = dbQuery.query || {};
                    const sort = dbQuery.sort || { timestamp: -1 };
                    const limit = Math.min(dbQuery.limit || 10, 20);

                    // Convert ISO string dates to Date objects
                    if (query.timestamp && typeof query.timestamp === 'object') {
                        if (query.timestamp.$gte && typeof query.timestamp.$gte === 'string') {
                            query.timestamp.$gte = new Date(query.timestamp.$gte);
                        }
                        if (query.timestamp.$lte && typeof query.timestamp.$lte === 'string') {
                            query.timestamp.$lte = new Date(query.timestamp.$lte);
                        }
                    }

                    dbData = await Log.find(query).sort(sort).limit(limit).lean();
                    console.log(`[AI] Found ${dbData.length} records`);
                }
            } catch (e) {
                console.warn('[AI] Failed to parse/execute query:', e.message);
                // Continue as normal chat
            }

            // 2. Final Response Generation
            let finalPrompt = '';

            if (dbData && dbData.length > 0) {
                // Summarize data for better context
                const summary = {
                    totalRecords: dbData.length,
                    statusCodes: [...new Set(dbData.map(d => d.status))],
                    avgLatency: Math.round(dbData.reduce((sum, d) => sum + d.latencyMs, 0) / dbData.length),
                    errorCount: dbData.filter(d => d.status >= 400).length
                };

                finalPrompt = `You are a monitoring system assistant. Answer the user's question based on ACTUAL DATA from the database.

User Question: "${prompt}"

DATABASE RESULTS (${dbData.length} records found):
Summary: ${JSON.stringify(summary)}
Sample Records: ${JSON.stringify(dbData.slice(0, 5))}

INSTRUCTIONS:
- Provide a DIRECT answer with specific numbers and timestamps
- Cite actual data points (e.g., "At 10:23 AM, status 500 with 2500ms latency")
- If asked about issues, list them with details
- If asked about performance, mention specific latency values
- Be concise and actionable
- DO NOT ask for clarification - answer based on the data provided`;
            } else if (dbQuery) {
                finalPrompt = `You are a monitoring system assistant.

User Question: "${prompt}"

I searched the database but found NO matching records for this query.

Respond by:
1. Confirming no data was found
2. Suggesting the system might be healthy or the time range might be different
3. Keep it brief and positive`;
            } else {
                finalPrompt = `${systemContext}\n\nUser: ${prompt}`;
            }

            const result = await model.generateContent(finalPrompt);
            const finalResponse = await result.response;
            const responseText = finalResponse.text();

            callCount++;

            // Accurate Token Counting
            let totalInputTokens = 0;
            let totalOutputTokens = 0;

            try {
                // Count tokens for the prompts
                const countResult1 = await model.countTokens(queryPrompt);
                const countResult2 = await model.countTokens(finalPrompt);
                totalInputTokens = countResult1.totalTokens + countResult2.totalTokens;

                // For output, we use the usage metadata if available, otherwise estimate
                if (finalResponse.usageMetadata) {
                    totalOutputTokens = finalResponse.usageMetadata.candidatesTokenCount || (responseText.length / 4);
                } else {
                    totalOutputTokens = responseText.length / 4;
                }
            } catch (te) {
                console.warn('[AI] Token counting failed, falling back to estimation', te);
                totalInputTokens = (queryPrompt.length + finalPrompt.length) / 4;
                totalOutputTokens = responseText.length / 4;
            }

            const cost = estimateCost(totalInputTokens, totalOutputTokens);

            await AICache.create({
                promptHash,
                originalQuery: prompt.substring(0, 200),
                response: responseText,
                inputTokens: Math.ceil(totalInputTokens),
                outputTokens: Math.ceil(totalOutputTokens)
            });

            // Persistent Usage Tracking
            await AIUsage.create({
                inputTokens: Math.ceil(totalInputTokens),
                outputTokens: Math.ceil(totalOutputTokens),
                type: systemContext.includes('Reliability') ? 'incident_analysis' : 'chat'
            });

            return { text: responseText, cached: false, inputTokens: totalInputTokens, outputTokens: totalOutputTokens, cost };

        } catch (error) {
            console.error('[AI] Gemini Error:', error);
            throw new Error(`Failed to generate AI response: ${error.message}`);
        }
    },

    detectAnomalies: async (log) => {
        const isHighLatency = log.latencyMs > 2000;
        const isServerError = log.status >= 400;

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
                threshold: isHighLatency ? '> 2000ms' : '>= 400',
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
