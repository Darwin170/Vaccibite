const jwt = require("jsonwebtoken");
const User = require("../model/usermode");
const OTP = require("../model/OPT");

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found." });

    const otpRecord = await OTP.findOne({ userId: user._id });
    if (!otpRecord) return res.status(400).json({ msg: "No OTP found. Please login again." });

    if (Date.now() > otpRecord.expiresAt.getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ msg: "OTP expired. Please login again." });
    }

    if (parseInt(otp) !== otpRecord.otp) {
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    // OTP valid — delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create JWT
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

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { verifyOTP };
