// server/gemini.config.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash";

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "AIzaGeminiApiKey") {
    console.error("⚠️  WARNING: GEMINI_API_KEY is missing or set to default placeholder in .env! AI features will likely fail.");
}

export const genAI = new GoogleGenerativeAI(API_KEY);

// Use the correct model name for the stable API
export const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest"
});

console.log("✅ Gemini 1.5 Flash initialized");