import OpenAI from "openai";
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
const baseURL = process.env.GEMINI_BASE_URL;

console.log("AI Config Initialized:");
console.log("  Base URL:", baseURL);
console.log("  Model:", process.env.GEMINI_MODEL);
console.log("  API Key Present:", !!apiKey);

const ai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});


export default ai