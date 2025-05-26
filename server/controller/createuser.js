const User = require('../model/usermode');

// Register User
const createUser = async (req, res) => {
  const { name, email, phone, password,position } = req.body;

  // Check if any field is missing
  if (!name || !email || !phone || !password || !position) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 👇 No need to hash password manually anymore!
    const newUser = new User({
      name,
      email,
      phone,
      password,// this will be hashed by the schema
      position 
    });

    // Save user to the database
    await newUser.save();

    // Send success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createUser };
