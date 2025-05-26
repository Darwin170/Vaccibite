const ActivityLog = require("../model/Activitylogs");

const createLogs = async (req, res) => {
  try {
    const { user, action, details } = req.body;

    if (!user || !action) {
      return res.status(400).json({ message: "user and action are required" });
    }

    const newLog = new ActivityLog({
      user,
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

module.exports = createLogs;
