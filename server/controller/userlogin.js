const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/usermode");
const OTP = require("../model/OPT");
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
     const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });


    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "No user with this email." });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password." });

    // If user is Superior_Admin or System_Admin → OTP login
    if (["Superior_Admin", "System_Admin"].includes(user.position)) {
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

        return res.json({ msg: "OTP sent to your Gmail. Please verify." });
      } catch (err) {
        console.error("Failed to send OTP email:", err);
        return res.status(500).json({ msg: "Failed to send OTP email. Try again later." });
      }
    }

    // Non-admin → login directly with JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, position: user.position },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // optional
    );

    return res.json({ msg: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { loginUser };

