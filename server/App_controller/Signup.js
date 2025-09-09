const User = require('../model/M_user');
const generateId = require('../utils/generateId');
const bcrypt = require('bcryptjs');

const signupUser = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, barangay } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !confirmPassword || !barangay) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate custom userId
    const MuserId = await generateId('Muser');

    // Create new user document
    const newUser = new User({
      MuserId, // ✅ generated ID
      fullName,
      email,
      password: hashedPassword,
      barangay,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully!',
      MuserId,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = { signupUser };

