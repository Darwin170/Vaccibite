const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/usermode');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request:", req.body);

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    console.log("User found:", user);

    if (!user) return res.status(400).json({ msg: "NO EMAIL" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    // 🔑 Generate JWT (expires in 1 hour)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Don’t send password hash back!
    const { password: _, ...userData } = user._doc;

    res.json({
      msg: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = { loginUser };
