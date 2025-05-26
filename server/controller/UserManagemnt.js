const User = require('../model/usermode');

const getUser = async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users);     
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

module.exports = { getUser };
