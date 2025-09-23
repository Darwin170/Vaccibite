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
    
    // 1. Find the user
    const user = await User.findOne({ email: normalizedEmail }).select("-password");
    if (!user) {
      // Return a generic error to avoid user enumeration
      return res.status(400).json({ msg: "Invalid email or OTP." });
    }

    // 2. Find the OTP record in the database
    const otpRecord = await OTP.findOne({ userId: user._id });
    if (!otpRecord) {
      return res.status(400).json({ msg: "No OTP found. Please log in again." });
    }

    // 3. Check if the OTP has expired
    if (Date.now() > otpRecord.expiresAt.getTime()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ msg: "OTP expired. Please log in again." });
    }

    // 4. Validate the OTP
    if (parseInt(otp) !== otpRecord.otp) {
      // Delete the OTP record on an invalid attempt for added security
      await OTP.deleteOne({ _id: otpRecord._id }); 
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    // 5. OTP is valid - delete the record and generate a token
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
