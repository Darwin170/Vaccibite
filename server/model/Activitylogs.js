const mongoose = require("mongoose");
// Make sure both user models are required so Mongoose knows about them
require("../model/usermode");   // Your UserAccounts model
require("../model/M_user");     // Your M_User model

const activityLog = new mongoose.Schema({
  // This 'user' field will hold the ObjectId of a user from either collection.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel' // This is the key that makes it dynamic
  },
  onModel: {
    type: String,
    required: true,
    enum: ['UserAccounts', 'Mobile_User'] // Only these values are allowed
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
