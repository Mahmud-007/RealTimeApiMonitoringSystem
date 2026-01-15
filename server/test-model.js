const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // There is no direct listModels on genAI instance in some SDK versions,
        // but usually it's there or accessible via the API directly.
        // However, the node SDK usually doesn't expose listModels in the main class easily?
        // Wait, it does via `makeManager` or similar? 
        // Actually, looking at docs, there isn't a simple listModels helper in the node SDK for the client instance often?
        // Let's try to assume it might not work easily.

        // BUT the error message suggested calling it.
        // Let's try to just fetch the model info if possible.

        // Alternate strategy: I will try the most standard 'gemini-1.0-pro'
        console.log("Trying gemini-1.0-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent("Test");
        console.log("Success with gemini-1.0-pro");

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
