const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testAI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API key found in .env");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testAI();
