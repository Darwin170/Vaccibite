const jwt = require('jsonwebtoken');
const User = require('../model/usermode');
const OTP = require('../model/OPT');

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    const user = await User.findOne({ email: normalizedEmail }).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or OTP." });
    }

    const otpRecord = await OTP.findOne({ userId: user._id });
    if (!otpRecord) {
      return res.status(400).json({ msg: "No OTP found. Please log in again." });
    }

    if (Date.now() > otpRecord.expiresAt.getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ msg: "OTP expired. Please log in again." });
    }

    // 4. Validate the OTP (Corrected syntax below)
    if (otp !== otpRecord.otp.toString()) {
      // The code inside this block only runs if the OTPs don't match
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    // 5. OTP is valid (This code only runs if the if-block above is skipped)
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = jwt.sign(
      { id: user._id, email: user.email, position: user.position },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userData } = user._doc;

    return res.json({
      msg: "Login successful!",
      token,
      user: userData
    });

  } catch (err) {
    console.error("Unexpected verifyOTP error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { verifyOTP };
