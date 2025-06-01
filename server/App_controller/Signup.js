const User = require('../model/M_user'); // adjust path to your User model


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

    // Check if user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user document
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      barangay,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signupUser };
