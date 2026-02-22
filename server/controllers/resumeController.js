import Resume from "../models/Resume.js"
import fs from "fs"

// controller for creating a new resume
//Post: /api/resumes/create
import imagekit from "../configs/imageKit.js"

export const createResume = async (req, res) => {
    try {
        const userId = req.userId
        const { title } = req.body

        //create a new Resume

        const newResume = await Resume.create({ userId, title })

        //return success message
        return res.status(201).json({
            message: "Resume created Successfully",
            resume: newResume
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })

    }
}

//controller for deleting a resume

//Delete: /api/resumes/delete

export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId
        const { resumeId } = req.params

        await Resume.findOneAndDelete({ userId, _id: resumeId })

        //return success message
        return res.status(200).json({ message: "Resume deleted Successfully" })

    } catch (error) {
        return res.status(400).json({ message: error.message })

    }
}

//get user resume by id

//Get: /api/resumes/get

export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId
        const { resumeId } = req.params

        const resume = await Resume.findOne({ userId, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }
        resume.__v = undefined
        resume.createdAt = undefined
        resume.updatedAt = undefined

        return res.status(200).json({ resume })

    } catch (error) {
        return res.status(400).json({ message: error.message })

    }
}

//get resume by id public
//Get: /api/resumes/public

export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params
        const resume = await Resume.findOne({ public: true, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        return res.status(200).json({ resume })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for updating a resume
//Put :/api/resumes/update

export const updateResume = async (req, res) => {
    try {
        const userId = req.userId
        const { resumeId, resumeData, removeBackground } = req.body
        const image = req.file

        let resumeDataCopy;

        if (typeof resumeData === "string") {
            resumeDataCopy = JSON.parse(resumeData)
        } else {
            resumeDataCopy = structuredClone(resumeData)
        }

        // First, verify the resume belongs to this user
        const existingResume = await Resume.findOne({ _id: resumeId, userId });
        if (!existingResume) {
            return res.status(404).json({ message: "Resume not found or unauthorized" });
        }

        console.log("📥 Received removeBackground:", removeBackground, "Type:", typeof removeBackground);

        if (image) {
            // Validate ImageKit configuration
            if (!process.env.IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT.includes('yourname')) {
                throw new Error("ImageKit URL endpoint not configured. Please update IMAGEKIT_URL_ENDPOINT in .env file");
            }

            let imageBuffer = fs.readFileSync(image.path);

            console.log("🖼️ Processing image with removeBackground:", removeBackground);

            // If background removal is requested, process with remove.bg API
            if (removeBackground === "yes") {
                console.log("🎨 Calling remove.bg API for background removal...");

                if (!process.env.REMOVEBG_API_KEY || process.env.REMOVEBG_API_KEY === 'your_removebg_api_key_here') {
                    console.warn("⚠️ Remove.bg API key not configured. Uploading original image.");
                } else {
                    try {
                        // Convert image buffer to base64
                        const base64Image = imageBuffer.toString('base64');

                        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Api-Key': process.env.REMOVEBG_API_KEY,
                            },
                            body: JSON.stringify({
                                image_file_b64: base64Image,
                                size: 'auto'
                            })
                        });

                        if (response.ok) {
                            const arrayBuffer = await response.arrayBuffer();
                            imageBuffer = Buffer.from(arrayBuffer);
                            console.log("✅ Background removed successfully!");
                        } else {
                            const errorText = await response.text();
                            console.error("❌ Remove.bg API error:", errorText);
                            console.warn("⚠️ Uploading original image without background removal");
                        }
                    } catch (error) {
                        console.error("❌ Background removal failed:", error.message);
                        console.warn("⚠️ Uploading original image without background removal");
                    }
                }
            }

            // Upload to ImageKit
            const uploadOptions = {
                file: imageBuffer,
                fileName: 'resume_' + Date.now() + '.png',
                folder: "user-resumes"
            };

            console.log("📤 Uploading to ImageKit...");

            try {
                const response = await imagekit.upload(uploadOptions);
                console.log("✅ Image uploaded successfully");
                console.log("📍 Image URL:", response.url);

                // Apply transformations via URL for resizing
                let finalUrl = response.url;
                const urlParts = response.url.split('/user-resumes/');
                if (urlParts.length === 2) {
                    finalUrl = urlParts[0] + '/user-resumes/tr:w-300,h-300,fo-face,c-maintain_ratio/' + urlParts[1];
                    console.log("📍 Transformed URL:", finalUrl);
                }

                resumeDataCopy.personal_info.image = finalUrl;
            } catch (error) {
                console.error("❌ ImageKit upload error:", error.message);
                console.error("Error details:", error);
                throw new Error("Failed to upload image: " + error.message);
            }

            // Clean up temp file
            fs.unlinkSync(image.path);
        }

        // Update the resume with the new data
        const resume = await Resume.findByIdAndUpdate(
            { userId, _id: resumeId },
            resumeDataCopy,
            { new: true, runValidators: true }
        )

        console.log(`✅ Resume updated: ${resume._id}, Title: ${resume.title}`);

        return res.status(200).json({ message: "Saved Successfully", resume })
    } catch (error) {
        console.error("Update Resume Error:", error);
        return res.status(400).json({ message: error.message })
    }
}