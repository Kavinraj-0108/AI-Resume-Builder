// Controller for AI-powered resume operations

import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";
import { model, genAI } from "../gemini.config.js";
import { createRequire } from 'module';
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// ============================================
// POST: /api/ai/enhance-pro-sum
// Enhance Professional Summary
// ============================================
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert resume writing Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it compelling and ATS-friendly. Return ONLY the enhanced text, no options or formatting."
                },
                {
                    role: "user",
                    content: userContent
                }
            ]
        });

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

}

//controller for enhancing a resume's job description
//Post:/api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: `You are an expert resume writing . 
                        Your task is to enhance the job description of a resume.
                         The job description should be 1-2 sentences highlighting key
                         responsibilities and achievements. Use action verbs and
                          quantifiable results where possible. Make it compelling and 
                          ATS-friendly. Return ONLY the enhanced text, no options or formatting.`
                },
                {
                    role: "user",
                    content: userContent
                }
            ]
        });

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


//controller for uploading a resume to the database
//POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        const userId = req.userId;

        if (!resumeText) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const systemPrompt = `You are an expert AI Agent to extract data 
            from resume.`

        const userPrompt = `Extract data from this resume: ${resumeText} 
            
            Provide data in the following JSOn format with no additional text before 
            or after:
            

            {
             professional_summary: {
                type: String, default: ""
            },
            skills: [{
                type: String
            }],
            personal_info: {
                image: { type: String, default: "" },
                full_name: { type: String, default: "" },
                profession: { type: String, default: "" },
                email: { type: String, default: "" },
                phone: { type: String, default: "" },
                location: { type: String, default: "" },
                linkedin: { type: String, default: "" },
                website: { type: String, default: "" },
            },
            experience: [
                {
                    company: { type: String },
                    position: { type: String },
                    start_date: { type: String },
                    end_date: { type: String },
                    description: { type: String },
                    is_current: { type: Boolean },
                }
            ],
            project: [
                {
                    name: { type: String },
                    type: { type: String },
                    description: { type: String },
                }
            ],
            education: [
                {
                    institution: { type: String },
                    degree: { type: String },
                    field: { type: String },
                    graduation_date: { type: String },
                    gpa: { type: String },
                }
            ]}
            `

        const response = await ai.chat.completions.create({
            model: process.env.GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            response_format: {
                type: "json_object"
            }
        });
        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData);
        const newResume = await Resume.create({ userId, title, ...parsedData });
        res.json({ resumeId: newResume._id });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

