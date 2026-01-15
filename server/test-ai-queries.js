const axios = require('axios');

async function testAIQueries() {
    const baseURL = 'http://localhost:3000/api/ai';

    const testQuestions = [
        "Summarize any issues in the last 24 hours",
        "What were the slowest response times today?",
        "Show me recent errors"
    ];

    for (const question of testQuestions) {
        try {
            console.log(`\n\n========================================`);
            console.log(`Question: "${question}"`);
            console.log(`========================================`);

            const chatRes = await axios.post(`${baseURL}/chat`, {
                prompt: question
            });

            console.log(`Response: ${chatRes.data.text}`);

        } catch (error) {
            console.error(`Error for "${question}":`, error.message);
        }
    }
}

testAIQueries();
