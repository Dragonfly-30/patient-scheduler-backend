const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require('../models/User'); 
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

const registerUser = async(req, res) => {
    console.log("Received request for user registration");

    try{
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create new user with OTP
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'patient',
            isVerified: false,
            otp: otp,
            otpExpires: otpExpires,
            otpAttempts: 0
        });
        
        await newUser.save();

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, name);
        if (!emailResult.success) {
            // If email fails, delete the user and return error
            await User.findByIdAndDelete(newUser._id);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again."
            });
        }
        
        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for OTP verification code.",
            userId: newUser._id,
            email: newUser.email,
            requiresVerification: true
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while registering the user.",
            error: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "User ID and OTP are required"
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid user"
            });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        // Check OTP attempts (max 5 attempts)
        if (user.otpAttempts >= 5) {
            return res.status(400).json({
                success: false,
                message: "Too many failed attempts. Please request a new OTP.",
                needsNewOTP: true
            });
        }

        // Check if OTP expired
        if (new Date() > user.otpExpires) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
                needsNewOTP: true
            });
        }

        // Verify OTP
        if (user.otp !== otp.trim()) {
            // Increment failed attempts
            user.otpAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`
            });
        }

        // OTP is correct - verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();

        // Generate token for verified user
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Account verified successfully!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred during verification.",
            error: error.message
        });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid user"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with new OTP
        user.otp = otp;
        user.otpExpires = otpExpires;
        user.otpAttempts = 0; // Reset attempts
        await user.save();

        // Send new OTP email
        const emailResult = await sendOTPEmail(user.email, otp, user.name);
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again."
            });
        }

        res.status(200).json({
            success: true,
            message: "New OTP sent to your email successfully!"
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while resending OTP.",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    console.log("Received request for user login");

    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        // Find user in DB
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email before logging in",
                requiresVerification: true,
                userId: user._id
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while logging in.",
            error: error.message
        });
    }
}; 

module.exports = { 
    registerUser, 
    loginUser, 
    verifyOTP, 
    resendOTP 
};