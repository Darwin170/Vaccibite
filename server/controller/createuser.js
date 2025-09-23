const User = require('../model/usermode');
const generateId = require('../utils/generateId');
const ActivityLog = require('../model/Activitylogs'); // Import the ActivityLog model

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

    // Create the activity log here
    const newLog = new ActivityLog({
      user: req.user._id, // admin ID
      onModel: req.userType, // The model name for this user
      action: 'New User Registered',
      details: `New user ${newUser.email} registered with position ${newUser.position}.`,
    });

    await newLog.save();

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