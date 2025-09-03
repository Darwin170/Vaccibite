const OTP = require("../model/OPT");
const User = require("../model/usermode");
const nodemailer = require("nodemailer");

// Gmail transporter
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

// ---------------- RESEND OTP ----------------
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: "User not found." });

    // Delete old OTP
    await OTP.deleteMany({ userId: user._id });

    // Generate and save new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.create({ userId: user._id, otp, expiresAt: otpExpiry });

    // Send new OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Your New Login Verification Code",
      text: `Your new OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ msg: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { resendOtp };
