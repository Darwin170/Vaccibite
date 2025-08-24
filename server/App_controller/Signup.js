const User = require('../model/M_user');
const bcrypt = require('bcryptjs'); // 👈 Import bcryptjs

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

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user document with the HASHED password
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword, // 👈 Store the HASHED password
            barangay,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

module.exports = { signupUser };
