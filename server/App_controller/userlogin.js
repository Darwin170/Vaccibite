const User = require('../model/M_user'); 
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  try {
    const { barangay, email, password } = req.body;

    if (!barangay || !email || !password) {
      return res.status(400).json({ message: 'Please provide barangay, email, and password.' });
    }

    const user = await User.findOne({ barangay, email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid barangay or email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, barangay: user.barangay },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        barangay: user.barangay,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser };
