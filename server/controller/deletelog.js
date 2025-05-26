const ActivityLog = require("../model/Activitylogs");

const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLog = await ActivityLog.findByIdAndDelete(id);
    if (!deletedLog) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { deleteLog };
