const bcrypt = require("bcryptjs");
const User = require("../model/usermode");
const OTP = require("../model/OPT");
const nodemailer = require("nodemailer");

// Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "No user with this email." });

    // Only allow admins
    if (!["Superior_Admin", "System_Admin"].includes(user.position)) {
      return res.status(403).json({ msg: "Unauthorized position." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password." });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Remove old OTPs
    await OTP.deleteMany({ userId: user._id });

    // Save new OTP
    await OTP.create({ userId: user._id, otp, expiresAt: otpExpiry });

    // Send OTP email safely
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your Login Verification Code",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
      });
    } catch (err) {
      console.error("Failed to send OTP email:", err);
      return res.status(500).json({ msg: "Failed to send OTP email. Try again later." });
    }

    res.json({ msg: "OTP sent to your email. Please verify." });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { loginUser };
