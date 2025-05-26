const User = require('../model/usermode');

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, position } = req.body;

    const updatedData = { name, email, phone, position };
    
    // Optional: rehash the password if it's provided
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

module.exports = {updateUser};