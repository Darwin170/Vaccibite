const ActivityLog = require("../model/Activitylogs");

const createLogs = async (req, res) => {
  try {
    const { action, details } = req.body;

    if (!req.user?.id || !req.user?.onModel || !action) {
      return res.status(400).json({ message: "user, onModel, and action are required" });
    }

    const newLog = new ActivityLog({
      user: req.user.id,
      onModel: req.user.onModel,
      action,
      details,
    });

    await newLog.save();
    res.status(201).json({ message: "Activity log saved" });
  } catch (error) {
    console.error("Error saving activity log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { createLogs };
