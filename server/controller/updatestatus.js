const Report = require("../model/reportsmodel");
const ActivityLog = require("../model/Activitylogs");
const Notification = require("../model/Notification");
let ioInstance;

// Initialize socket instance
const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId.toString());
      console.log(`Mobile user ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

// Update report status (admin only)
const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const file = req.file;

  try {
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const oldStatus = report.status;
    const newStatus = status;
    report.status = newStatus; // Update the status first

    // ✅ Conditional check for file upload
    if (file) {
      report.filePath = `uploads/${req.file.filename}`;
    } else if (newStatus !== "Ongoing") { // Check if a file is required
      // You can add logic here to enforce a file for other statuses
      // For example: return res.status(400).json({ message: "A file is required for this status change" });
    }
    // Note: The previous line `report.filePath = filepath;` was a typo, so it has been corrected.

    await report.save();

    // Log activity (admin action)
    const newLog = new ActivityLog({
      user: req.user._id,
      onModel: req.userType,
      action: "Report Status Updated",
      details: `Report ${report._id} updated from '${oldStatus}' to '${newStatus}'`
    });
    await newLog.save();

    // --- Create Notification for Mobile User ---
     if (report.userId) {
      const notification = await Notification.create({
        userId: report.userId,
        senderId: req.user._id,
        title: "Report Status Updated",
        message: `Your report "${report.type}" status changed from '${oldStatus}' to '${newStatus}'`,
        read: false
      });

      // Emit to mobile user via Socket.IO
      if (ioInstance) {
        // 1. Convert the Mongoose document to a clean JavaScript object
        let rawPayload = notification.toObject();

        // 2. Ensure the primary ID is a string (critical for Flutter parsing)
        // Mongoose _id is an ObjectId object; Flutter expects a String.
        if (rawPayload._id) {
            rawPayload._id = rawPayload._id.toString(); 
        }

        // 3. Emit the clean, string-safe payload
        console.log("Emitting clean notification payload to room:", report.userId.toString());
        ioInstance.to(report.userId.toString()).emit(
          "newNotification", 
          rawPayload
        );
      }
    }

    res.status(200).json({ message: "Report status updated", report });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: "Failed to update report status" });
  }
};
module.exports = { updateReportStatus, initSocket };





