const bcrypt = require("bcryptjs");
const User = require('../model/M_user');
const jwt = require('jsonwebtoken'); 
const OTP = require("../model/MOPT");
const nodemailer = require("nodemailer");
const ActivityLog = require("../model/Activitylogs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const loginUser = async (req, res) => {
    try {
        const { barangay, email, password } = req.body;
        if (!barangay || !email || !password) {
            return res.status(400).json({ message: 'Please provide barangay, email, and password.' });
        }
        // Find user
        const user = await User.findOne({ barangay, email });
        if (!user) return res.status(401).json({ message: 'Invalid barangay or email.' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password.' });
        // ✅ Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000); // 6-digit
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

        // Save OTP to DB
        await OTP.findOneAndUpdate(
            { userId: user._id },
            { otp: otpCode, expiresAt },
            { upsert: true, new: true }
        );

        const newLog = new ActivityLog({
      user: user._id,
      onModel: "Mobile_User",
      action: "User Logged In",
      details: `User ${user.email} successfully logged in.`,
    });
    await newLog.save();
        // Send OTP email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Your OTP Code',
          text: `Your OTP is ${otpCode}. It expires in 5 minutes.`,
        });

        //  FIX: Added the 'user' object to the response
        return res.json({ 
            message: "OTP sent. Please verify.", 
            email, 
            user: {
                _id: user._id, // Ensure you return the _id
                email: user.email,
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};



module.exports = { loginUser };




