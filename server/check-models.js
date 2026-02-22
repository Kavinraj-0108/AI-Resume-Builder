import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function listModels() {
    const apiKey = process.env.OPEN_API_KEY;
    if (!apiKey) {
        console.error("❌ API Key not found in environment!");
        return;
    }

    console.log("Checking available models for API Key:", apiKey.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Unfortunately, the Node SDK doesn't have a direct 'listModels' helper exposed easily in the main class in all versions,
        // but we can try a simple generation to test connectivity, or use the explicit ModelService if accessible.
        // Actually, let's just try to generate content with 'gemini-1.5-flash' and print the error specifically.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to generate content with 'gemini-1.5-flash'...");
        await model.generateContent("Hello");
        console.log("✅ Success! 'gemini-1.5-flash' is working.");

    } catch (error) {
        console.error("\n❌ Error with 'gemini-1.5-flash':");
        console.error(error.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("\nAttempting to generate content with 'gemini-pro'...");
        await model.generateContent("Hello");
        console.log("✅ Success! 'gemini-pro' is working.");
    } catch (error) {
        console.error("\n❌ Error with 'gemini-pro':");
        console.error(error.message);
    }
}

listModels();
