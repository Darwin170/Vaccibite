const User = require('../model/M_user');
const Barangay = require('../model/Barangay'); // ✅ import Barangay model
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
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // ✅ Find Barangay (accepts either ObjectId or name)
    let barangayId = barangay;
    if (!/^[0-9a-fA-F]{24}$/.test(barangay)) {
      // If not a valid ObjectId, assume it's a name
      const barangayDoc = await Barangay.findOne({ name: barangay });
      if (!barangayDoc) {
        return res.status(400).json({ message: 'Invalid barangay selected.' });
      }
      barangayId = barangayDoc._id;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate custom userId
    const MuserId = await generateId('user');

    // Create new user document
    const newUser = new User({
      MuserId,
      fullName,
      email,
      password: hashedPassword,
      barangay: barangayId, // ✅ always stored as ObjectId
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!', MuserId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

module.exports = { signupUser };
