const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url);

        console.log("Available Models (Flash/Pro):");
        response.data.models.forEach(m => {
            if (m.name.includes('flash') || m.name.includes('pro')) {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            }
        });

    } catch (error) {
        console.error("Error listing models:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
    }
}

listModels();
