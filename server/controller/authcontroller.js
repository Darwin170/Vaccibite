const jwt = require("jsonwebtoken");
const User = require("../model/usermode");
const OTP = require("../model/OPT");

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found." });

    // Find OTP record
    let otpRecord;
    try {
      otpRecord = await OTP.findOne({ userId: user._id });
      console.log("Fetched OTP record:", otpRecord);
    } catch (err) {
      console.error("Error fetching OTP from DB:", err);
      return res.status(500).json({ msg: "Server error fetching OTP." });
    }

    if (!otpRecord) {
      return res.status(400).json({ msg: "No OTP found. Please login again." });
    }

    // Check if OTP expired
    if (Date.now() > otpRecord.expiresAt.getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ msg: "OTP expired. Please login again." });
    }

    // Validate OTP
    if (parseInt(otp) !== otpRecord.otp) {
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    // OTP is valid — delete it
    try {
      await OTP.deleteOne({ _id: otpRecord._id });
    } catch (err) {
      console.error("Failed to delete OTP record:", err);
    }

    // Create JWT safely
    let token;
    try {
      token = jwt.sign(
        { id: user._id, email: user.email, position: user.position },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.error("JWT creation error:", err);
      return res.status(500).json({ msg: "Server error generating token." });
    }

    return res.json({
      msg: "Login successful!",
      token,
      user
    });

  } catch (err) {
    console.error("Unexpected verifyOTP error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { verifyOTP };
