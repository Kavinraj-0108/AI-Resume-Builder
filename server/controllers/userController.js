import User from "../models/User.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";
import crypto from "crypto";
import sendEmail from "../configs/email.js";

const generateToken = (userId) => {

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
    return token;

}

//controller for user registration
//Post : /api/users/register



export const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = req.body.email.toLowerCase().trim();

        //Check if required fields are present

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        //Chexk if user already exists

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        //Create new user

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        //Return success response

        await newUser.save();

        const token = generateToken(newUser._id);
        newUser.password = undefined; //hide password

        return res.status(201).json({
            message: "User registered successfully", token,
            user: newUser
        });

    } catch (error) {

        return res.status(400).json({ message: "Error registering user", error: error.message });

    }
}

//controller for user login
//Post : /api/users/login

export const loginUser = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email.toLowerCase().trim();

        //Chexk if user already exists

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        //Check if password matches

        if (!user.comparePassword(password)) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        //Return success response

        const token = generateToken(user._id);
        user.password = undefined; //hide password

        return res.status(200).json({
            message: "Login Successful", token,
            user: user
        });

        // await newUser.save();
        // res.status(201).json({ message: "User registered successfully" });

    } catch (error) {

        return res.status(400).json({ message: "Error registering user", error: error.message });

    }
}


//Controller for getting user by id

//Get:/api/users/data

export const getUserById = async (req, res) => {
    try {
        const userId = req.userId;

        //Check if user Exists
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "User not Found", error: error.message });
        }
        //return user
        user.password = undefined
        return res.status(200).json({ user });

        // await newUser.save();
        // res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error registering user", error: error.message });
    }
}


//controller for getting user resumes

//GET:/api/users/resumes

export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId

        //return user resumes
        const resumes = await Resume.find({ userId })
        return res.status(200).json({ resumes })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Controller for Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // Get reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset url
        // In production, this should be the frontend URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Recovery',
                message,
            });

            res.status(200).json({ message: 'Email sent' });
        } catch (err) {
            // dev mode: log the url
            console.log("-----------------------")
            console.log("PASSWORD RESET URL (Dev Mode):", resetUrl)
            console.log("-----------------------")

            // Return success even if email failed, so dev can test flows
            return res.status(200).json({
                message: 'Developer Mode: Redirecting to reset page...',
                resetToken // Return token for auto-navigation
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller for Reset Password
export const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



