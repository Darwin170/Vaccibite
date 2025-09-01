const M_User = require("../model/M_user");
const MOTP = require("../model/MOPT");
const nodemailer = require("nodemailer");

// --- Send OTP ---
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required." });

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await M_User.findOne({ email: normalizedEmail }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found." });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP with expiry (5 mins)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await MOTP.findOneAndUpdate(
      { userId: user._id },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Vaccibite" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return res.json({ msg: "OTP sent successfully ✅" });
  } catch (err) {
    console.error("sendOTP error:", err);
    return res.status(500).json({ msg: "Failed to send OTP." });
  }
};

module.exports = { sendOTP };
