const MUser = require("../model/M_user");
const ActivityLog = require('../model/Activitylogs'); // Import the ActivityLog model

const deleteMUser = async (req, res) => {
  try {
    const { id } = req.params;
   

    const deletedMUser = await MUser.findByIdAndDelete(id);

    if (!deletedMUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create the activity log here
    const newLog = new ActivityLog({
       user: req.user._id, // admin ID
      onModel: req.userType,
      action: 'Mobile User Account Deleted',
      details: `Mobile user with ID ${id} was deleted.`,
    });

    await newLog.save();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
 
module.exports = { deleteMUser };