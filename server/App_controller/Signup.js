const User = require('../model/M_user');
const generateId = require('../utils/generateId');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const signupUser = async (req, res) => {
  const filepath = req.file ? req.file.path : null;

  try {
    const { fullName, email, password, confirmPassword, barangay, filepath} = req.body;

    const cleanupFile = () => {
      if (filepath && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    };
    
    if (!fullName || !email || !password || !confirmPassword || !barangay || !filepath) {
      cleanupFile();
      return res.status(400).json({ message: 'Please fill in all fields and upload a confirmation document.' });
    }

    if (password !== confirmPassword) {
      cleanupFile();
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 8 ) {
      cleanupFile();
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      cleanupFile();
      return res
        .status(400)
        .json({ 
          message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@, $, !, %, *, ?, &).' 
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      cleanupFile();
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const MuserId = await generateId('Muser');

    const newUser = new User({
      MuserId,
      fullName,
      email,
      password: hashedPassword,
      barangay,
      isActivated: false,
      filepath: filepath, 
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully! Awaiting admin confirmation.',
      user: {
        MuserId: newUser.MuserId,
        fullName: newUser.fullName,
        email: newUser.email,
        barangay: newUser.barangay,
        isActivated: newUser.isActivated,
        filepath: newUser.filepath,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    cleanupFile(); 
    return res
      .status(500)
      .json({ message: 'Server error, please try again later.' });
  }
};

module.exports = { signupUser };

