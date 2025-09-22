const jwt = require('jsonwebtoken');
const M_User = require('../model/M_user');
const MOTP = require('../model/MOPT');

const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Basic input validation
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    // 2. Find the user
    const normalizedEmail = email.trim().toLowerCase();
    const user = await M_User.findOne({ email: normalizedEmail }).select('-password');
    if (!user) {
      // For security, don't reveal if the user doesn't exist.
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // 3. Find the OTP record in the database
    const otpRecord = await MOTP.findOne({ userId: user._id });

    // 4. Validate the OTP record
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // 5. Check for OTP expiration
    if (otpRecord.expiresAt < new Date()) {
      await MOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // 6. Compare the provided OTP with the one in the database
    if (otpRecord.otp !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // 7. If OTP is valid, delete it to prevent reuse
    await MOTP.deleteOne({ _id: otpRecord._id });

    // 8. Generate a temporary token for the password reset action
    const tempToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // Token is valid for 10 minutes
    );

    // 9. Send the response
    return res.json({
      message: 'OTP verified successfully. You can now reset your password.',
      tempToken,
      userId: user._id,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

module.exports = { verifyPasswordResetOTP };
