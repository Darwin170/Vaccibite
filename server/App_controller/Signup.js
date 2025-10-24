const User = require('../model/M_user');
const generateId = require('../utils/generateId');
const bcrypt = require('bcryptjs');

const signupUser = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, barangay } = req.body;

    // --- Basic validation ---
    if (!fullName || !email || !password || !confirmPassword || !barangay) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 8 ) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        return res
            .status(400)
            .json({ 
                message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@, $, !, %, *, ?, &).' 
            });
    }
    // --- Check if user already exists by email ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // --- Hash password once ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Generate custom userId ---
    const MuserId = await generateId('Muser');

    // --- Create new user document ---
    const newUser = new User({
      MuserId,        // ✅ generated ID
      fullName,
      email,
      password: hashedPassword,
      barangay,
      isActivated: false,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully!',
      user: {
        MuserId: newUser.MuserId,
        fullName: newUser.fullName,
        email: newUser.email,
        barangay: newUser.barangay,
        isActivated: newUser.isActivated,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res
      .status(500)
      .json({ message: 'Server error, please try again later.' });
  }
};

module.exports = { signupUser };


