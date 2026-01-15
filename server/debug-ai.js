const axios = require('axios');

async function testAI() {
    const baseURL = 'http://localhost:3000/api/ai';

    try {
        console.log("Testing /incidents...");
        const incRes = await axios.get(`${baseURL}/incidents`);
        console.log(`Incidents Status: ${incRes.status}`);
        console.log(`Incidents Found: ${incRes.data.length}`);

        console.log("\nTesting /chat...");
        const chatRes = await axios.post(`${baseURL}/chat`, {
            prompt: "Hello, are you working?"
        });
        console.log(`Chat Status: ${chatRes.status}`);
        console.log(`Chat Response: ${chatRes.data.text}`);

    } catch (error) {
        console.error("AI Test Failed:", error.message);
        console.error(error.stack);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testAI();
