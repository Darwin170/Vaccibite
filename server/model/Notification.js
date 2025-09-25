const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "M_User",  // Mobile user reference
    required: true 
  },
  reportId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reports"
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Notification", NotificationSchema);

