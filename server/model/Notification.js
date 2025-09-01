const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  senderId: { type: String, required: true },    // User who created the notification
  receiverId: { type: String, required: true },  // M_User who receives it
  title: String,
  message: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);

