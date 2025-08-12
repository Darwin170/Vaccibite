const jwt = require("jsonwebtoken");
const User = require("../model/usermode");

const verifyOTP = async (req, res) => {
  const { otp } = req.body;

  // Check if OTP session exists
  if (!req.session.otp || !req.session.otpExpiry || !req.session.userId) {
    return res.status(400).json({ msg: "No OTP found. Please log in again." });
  }

  // Check if OTP expired
  if (Date.now() > req.session.otpExpiry) {
    req.session.destroy();
    return res.status(400).json({ msg: "OTP expired. Please log in again." });
  }

  // Validate OTP
  if (parseInt(otp) !== req.session.otp) {
    return res.status(400).json({ msg: "Invalid OTP" });
  }

  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Clear OTP from session
    req.session.destroy();

    return res.json({
      msg: "Login successful!",
      token,
      user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error", error: err });
  }
};

module.exports = { verifyOTP };
