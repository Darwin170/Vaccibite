const Notification = require('../models/notificationModel');
const Report = require('../models/reportsmodel');

let io; // socket.io instance holder

// initialize socket from server.js
const initSocket = (socketIo) => {
  io = socketIo;
};

// Create notification when report status changes
const createNotification = async (req, res) => {
  try {
    const { reportId, status } = req.body;

    // Find the report
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Update report status
    report.status = status;
    await report.save();

    // Create notification
    const message = `Your report "${report.title}" status has been updated to ${status}`;
    const notification = new Notification({
      userId: report.userId,  // assuming report has userId field
      reportId: report._id,
      message
    });
    await notification.save();

    // Emit notification in real-time
    if (io) {
      io.to(report.userId.toString()).emit("newNotification", notification);
    }

    res.status(201).json({
      message: "Status updated & notification created",
      notification
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification" });
  }
};

module.exports = { createNotification, initSocket };
