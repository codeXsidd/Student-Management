const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Explain how AI works in a few words",
    });
    console.log("Response:", response.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
