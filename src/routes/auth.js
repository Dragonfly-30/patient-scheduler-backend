const express = require("express");
const router = express.Router();

const { 
    registerUser, 
    loginUser, 
    verifyOTP, 
    resendOTP 
} = require("../controllers/usercontroller");

// Existing routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// New OTP routes
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

module.exports = router;