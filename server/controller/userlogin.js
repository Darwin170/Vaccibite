const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/usermode");
const OTP = require("../model/OPT");
const ActivityLog = require("../model/Activitylogs"); // Added this import
const nodemailer = require("nodemailer");

// Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request:", req.body);

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "No user with this email." });
    const maxAttempts = 5;
    const lockDuration = 20 * 60 * 1000;

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({
        msg: `Too many login attempts. Your account is locked. Please try again in ${remainingTime} minutes.`,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= maxAttempts) {
        user.lockUntil = Date.now() + lockDuration;
        user.loginAttempts = 0; // Reset attempts after locking
        await user.save();
        return res.status(429).json({
          msg: `Too many failed login attempts. Your account has been locked for ${lockDuration / 60 / 1000} minutes.`,
        });
      }
      await user.save();
      return res.status(400).json({
        msg: `Invalid password. You have ${maxAttempts - user.loginAttempts} attempts remaining.`,
      });
    }
    // On a successful login
    user.loginAttempts = 0; // Reset counter
    user.lockUntil = null; // Clear lock
    await user.save();


    // === CHANGE STARTS HERE ===
    const newLog = new ActivityLog({
      user: user._id,
      onModel: "UserAccounts",
      action: "User Logged In",
      details: `User ${user.email} successfully logged in.`,
    });
    
    // This part has been refactored to always send an OTP,
    // regardless of the user's role.
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Delete old OTPs and save new one
    await OTP.deleteMany({ userId: user._id });
    await OTP.create({ userId: user._id, otp, expiresAt: otpExpiry });

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your Login Verification Code",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      });
      
      // Save the log before returning
      await newLog.save();

      return res.json({ msg: "OTP sent to your Gmail. Please verify." });
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      return res.status(500).json({ msg: "Failed to send OTP email. Try again later." });
    }
    // === CHANGE ENDS HERE ===
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};


module.exports = { loginUser };

