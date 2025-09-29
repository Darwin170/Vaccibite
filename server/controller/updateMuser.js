const M_User = require('../model/M_user');
const bcrypt = require('bcryptjs');

const ActivityLog = require('../model/Activitylogs');

const updateMUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email,  password } = req.body;
    const updatedData = { fullName, email, password };
    
    
    if (password) {
      updatedData.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    }

    const updatedUser = await  M_User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Create and save the activity log
    const newLog = new ActivityLog({
       user: req.user._id, // admin ID
      onModel: req.userType, // <-- The model name
      action: 'User Profile Updated',
      details: `User ${updatedUser.email} profile was updated.`,
    });
    
    await newLog.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};


module.exports = { updateMUser };
