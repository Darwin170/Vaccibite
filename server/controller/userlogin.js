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
    pass: process.env.EMAIL_PASS
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

    // If user is Superior_Admin or System_Admin → OTP login
    if (["Superior_Admin", "System_Admin"].includes(user.position)) {
      // Generate OTP and expiry
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      // Delete old OTPs for this user
      await OTP.deleteMany({ userId: user._id });

      // Save new OTP to DB
      await OTP.create({ userId: user._id, otp, expiresAt: otpExpiry });

      // Send OTP email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your Login Verification Code",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
      });

      return res.json({ msg: "OTP sent to your Gmail. Please verify." });
    }

    // If user is not admin → login directly with JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, position: user.position },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      msg: "Login successful!",
      token,
      user
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = { loginUser };


