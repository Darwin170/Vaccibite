const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  otp: { // must match the field used in loginUser & verifyOTP
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true }); // optional: keeps createdAt and updatedAt

module.exports = mongoose.model("OTP", otpSchema);
