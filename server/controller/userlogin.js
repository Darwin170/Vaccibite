const bcrypt = require('bcryptjs');
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

    res.json({ msg: "Login successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = { loginUser };
