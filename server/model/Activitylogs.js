const mongoose = require("mongoose");
require("../model/usermode");   // Assuming this is your UserAccounts model
require("../model/M_user");     // Assuming this is your Mobile_User model

const activityLog = new mongoose.Schema({
  // Use 'refPath' to reference a field that holds the model name
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel' 
  },
  // This field will contain the name of the model ('UserAccounts' or 'Mobile_User')
  onModel: {
    type: String,
    required: true,
    enum: ['UserAccounts', 'Mobile_User']
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ActivityLog", activityLog);