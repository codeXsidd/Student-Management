const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const getClient = (key) => {
    try {
        if (!key) return null;
        return new GoogleGenAI({ apiKey: key });
    } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err.message);
        return null;
    }
};

const callAI = async (prompt, systemInstruction = "You are a helpful AI agent.") => {
    let key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "") throw new Error("API_KEY_MISSING");

    key = key.trim().replace(/^["']|["']$/g, '');
    const client = getClient(key);
    if (!client) throw new Error("AI_CLIENT_INITIALIZATION_FAILED");

    const models = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 Agent AI Attempt: ${modelName}`);
            const model = client.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser Request: ${prompt}` }] }],
            });

            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ Agent AI Success: ${modelName}`);
                return text.trim();
            }
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Model ${modelName} failed:`, err.message);
            continue;
        }
    }

    throw new Error(lastError ? lastError.message : "Connection failed to all Gemini models.");
};

// 1. Welcome Agent
router.post('/welcome', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const prompt = `Greet the student ${name || 'User'} and introduce them to the Agentic DevHub. 
        Explain that there are two other agents here: 
        1. The Issue Resolver (for debugging code)
        2. The PR Reviewer (for reviewing code changes).
        Keep it inspiring, premium, and concise.`;

        const systemInstruction = "You are the StudyTrack Onboarding Bot. You are professional, encouraging, and helpful.";
        const response = await callAI(prompt, systemInstruction);
        res.json({ message: response });
    } catch (err) {
        res.status(500).json({ message: "Welcome Agent Error", error: err.message });
    }
});

// 2. Issue Resolver Agent (Developer Issue)
router.post('/issue-resolver', auth, async (req, res) => {
    try {
        const { issue, code, language } = req.body;
        if (!issue) return res.status(400).json({ message: "Issue description is required" });

        const prompt = `Analyze the following issue in ${language || 'the code'}:
        
        ISSUE DESCRIPTION:
        ${issue}
        
        CODE:
        ${code || 'No code provided.'}
        
        Provide:
        1. Diagnosis: What is causing the problem?
        2. Solution: How to fix it?
        3. Code Snippet: The corrected code.
        4. Prevention Tip: How to avoid this in the future.
        
        Format the response in Markdown.`;

        const systemInstruction = "You are a Senior Debugging Engineer. You provide clear, technical, yet easy-to-understand advice for students.";
        const response = await callAI(prompt, systemInstruction);
        res.json({ analysis: response });
    } catch (err) {
        res.status(500).json({ message: "Issue Resolver Error", error: err.message });
    }
});

// 3. PR Reviewer Agent (PR Issue)
router.post('/pr-reviewer', auth, async (req, res) => {
    try {
        const { code, context } = req.body;
        if (!code) return res.status(400).json({ message: "Code to review is required" });

        const prompt = `Review the following code changes/PR:
        
        CONTEXT:
        ${context || 'General code review.'}
        
        CODE:
        ${code}
        
        Provide a professional code review focusing on:
        - Best practices
        - Performance
        - Security
        - Readability
        
        Format the response in Markdown with clear headings.`;

        const systemInstruction = "You are a Tech Lead. Your reviews are constructive, thorough, and follow industry standards.";
        const response = await callAI(prompt, systemInstruction);
        res.json({ review: response });
    } catch (err) {
        res.status(500).json({ message: "PR Reviewer Error", error: err.message });
    }
});

module.exports = router;
