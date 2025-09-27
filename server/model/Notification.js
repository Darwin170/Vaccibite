const mongoose = require("mongoose");


const NotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "M_User",  // Mobile user reference
    required: true 
  },
  reportId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reports"
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming Admins are also in the M_User collection
    required: true // It might be null if the notification is system-generated
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Notification", NotificationSchema);




