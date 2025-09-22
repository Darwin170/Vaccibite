const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/M_user');


const resetPassword = async (req, res) => {
  try {
    const { tempToken, newPassword } = req.body;

    // 1. Basic input validation
    if (!tempToken || !newPassword) {
      return res.status(400).json({ message: 'Temporary token and new password are required.' });
    }

    // 2. Verify the temporary token
    let decodedToken;
    try {
      decodedToken = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired temporary token.' });
    }

    // 3. Check the token's purpose to prevent misuse
    if (decodedToken.purpose !== 'password-reset') {
      return res.status(403).json({ message: 'Forbidden: Invalid token purpose.' });
    }

    // 4. Find the user by ID from the decoded token
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 5. Hash the new password and update the user record
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // 6. Send a success response
    return res.json({ message: 'Password successfully reset.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
};

module.exports = { resetPassword };
