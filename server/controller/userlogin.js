const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/usermode");
const OTP = require("../model/OPT");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();

    // 2. Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: "No user with this email." });
    }

    // 3. Extra safety check for missing password
    if (!user.password) {
      return res.status(500).json({ msg: "This user has no password set." });
    }

    // Reset attempts if time window passed
    if (user.lastAttempt && Date.now() - user.lastAttempt.getTime() > WINDOW_MS) {
      user.loginAttempts = 0;
    }

    // Check if locked out
    if (user.loginAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ msg: "Too many login attempts. Try again later." });
    }

    // Only allow admins
    if (!["Superior_Admin", "System_Admin"].includes(user.position)) {
      return res.status(403).json({ msg: "Unauthorized position." });
    }

    // 4. Compare password safely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts += 1;
      user.lastAttempt = new Date();
      await user.save();
      return res.status(400).json({
        msg: `Invalid password. Attempts left: ${MAX_ATTEMPTS - user.loginAttempts}`,
      });
    }

    // ✅ Success → reset attempts
    user.loginAttempts = 0;
    user.lastAttempt = null;
    await user.save();

    // If admin → OTP login
    if (["Superior_Admin", "System_Admin"].includes(user.position)) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

      await OTP.deleteMany({ userId: user._id }); // remove old OTPs
      await OTP.create({ userId: user._id, otp, expiresAt: otpExpiry });

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

    // Non-admin → JWT login
    const token = jwt.sign(
      { id: user._id, email: user.email, position: user.position },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      msg: "Login successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


module.exports = { loginUser };

