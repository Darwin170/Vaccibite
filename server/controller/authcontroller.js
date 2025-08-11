const jwt = require('jsonwebtoken');
const User = require('../model/usermode');

const verifyOTP = async (req, res) => {
  const { otp } = req.body;

  if (!req.session.otp || !req.session.otpExpiry || !req.session.userId) {
    return res.status(400).json({ msg: "No OTP found. Please log in again." });
  }

  if (Date.now() > req.session.otpExpiry) {
    delete req.session.otp;
    delete req.session.otpExpiry;
    delete req.session.userId;
    return res.status(400).json({ msg: "OTP expired. Please log in again." });
  }

  if (parseInt(otp) !== req.session.otp) {
    return res.status(400).json({ msg: "Invalid OTP" });
  }

  try {
    const user = await User.findById(req.session.userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Clear OTP
    delete req.session.otp;
    delete req.session.otpExpiry;
    delete req.session.userId;

    // Send back user info + token
    res.json({
      msg: "Login successful!",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err });
  }
};

module.exports = { verifyOTP };
