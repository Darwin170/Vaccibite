const User = require('../model/usermode');
const generateId = require('../utils/generateId');

// Register User
const createUser = async (req, res) => {
  const { name, email, phone, password, position } = req.body;

  if (!name || !email || !phone || !password || !position) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 🔹 Generate custom userId
    const userId = await generateId("user");

    const newUser = new User({
      userId,
      name,
      email,
      phone,
      password, // gets hashed by schema
      position 
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        position: newUser.position
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createUser };
