const MUser = require("../model/M_user");


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

    // TODO: Replace this with email/SMS sending service
    console.log(`OTP for MUser ${user.email}: ${otp}`);

    res.json({ msg: "OTP sent successfully! Please check your email." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { sendMUserOTP };
