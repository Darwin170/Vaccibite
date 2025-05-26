const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barangay',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Ongoing', 'Resolved'],
    default: 'Pending'
  },
  filePath: {
    type: String
  }
});

const Report = mongoose.model('Reports', reportSchema, 'Reports');
module.exports = Report;
