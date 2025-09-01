const bcrypt = require("bcryptjs");
const User = require('../model/M_user');
const jwt = require('jsonwebtoken'); 
const OTP = require("../model/MOPT"); // 👈 OTP model

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

        // Send OTP email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Your OTP Code',
          text: `Your OTP is ${otpCode}. It expires in 5 minutes.`,
        });

        return res.json({ message: "OTP sent. Please verify.", email });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

module.exports = { loginUser };

