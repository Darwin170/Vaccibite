const bcrypt = require("bcryptjs");
const User = require('../model/M_user');
const jwt = require('jsonwebtoken'); 

const loginUser = async (req, res) => {
    try {
        const { barangay, email, password } = req.body;

        if (!barangay || !email || !password) {
            return res.status(400).json({ message: 'Please provide barangay, email, and password.' });
        }

        // Find the user by barangay and email
        const user = await User.findOne({ barangay, email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid barangay or email.' });
        }

        // Use bcrypt.compare to check the password
        const isMatch = await bcrypt.compare(password, user.password); // 👈 Correctly compare hashed passwords
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Create a JWT payload. Use a unique identifier like the user's ID.
        const payload = {
            id: user._id,
            email: user.email,
        };

        // Create a JWT token with a secret key
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret_key', // 👈 Use an environment variable for the secret key
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({
            message: 'Login successful',
            token: token, // 👈 Send the token to the client
            user: {
                id: user._id,
                barangay: user.barangay,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login. Please try again later.' });
    }
};

module.exports = { loginUser };

