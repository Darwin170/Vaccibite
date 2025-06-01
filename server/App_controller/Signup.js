const User = require('../model/M_user');


const signupUser = async (req, res) => {
  try {

    const { fullName, email, password, barangay } = req.body;

    if (!fullName || !email || !password || !barangay) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    
    // Create new user document
    const newUser = new User({
      fullName,
      email,
      password,
      barangay,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    // More specific error messages for debugging:
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // Duplicate key error (e.g., duplicate email)
        return res.status(400).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

module.exports = { signupUser };
