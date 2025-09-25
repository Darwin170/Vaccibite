const User = require('../model/M_user');
const OTP = require('../model/MOPT');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, do not reveal if the email does not exist.
      // Simply return a generic success message.
      return res.json({ message: 'If a user with that email exists, an OTP has been sent.' });
    }

    // Generate and save OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await OTP.findOneAndUpdate(
      { userId: user._id },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otpCode}. It expires in 5 minutes.`,
    });

    // Return a success message and the user's ID for the next step
    return res.json({
      message: 'OTP sent successfully. Please check your email.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { sendotp };
