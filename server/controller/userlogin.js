const bcrypt = require('bcryptjs');
const User = require('../model/usermode');
const nodemailer = require('nodemailer');

// Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail App Password
  }
});

// Simple OTP generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "NO EMAIL" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + (5 * 60 * 1000); // 5 min from now

    // Store OTP in session
    req.session.otp = otp;
    req.session.otpExpiry = otpExpiry;
    req.session.userId = user._id;

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Your Login Verification Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ msg: "OTP sent to your Gmail. Please verify." });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = { loginUser };
