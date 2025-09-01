const MUser = require("../model/M_user");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail
    pass: process.env.EMAIL_PASS,   // App password
  },
});

const sendMUserOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if MUser exists
    const user = await MUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store in session
    req.session.otp = otp;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000; 
    req.session.userId = user._id;

    // --- Send OTP via email ---
    await transporter.sendMail({
      from: `"Vaccibite" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Vaccibite OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ msg: "OTP sent successfully! Please check your email." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { sendMUserOTP };
