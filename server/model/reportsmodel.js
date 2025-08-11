const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Animal Bite', 'Missing Animal', 'Roaming Animal']
  },

  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barangays',
    required: true
  },
  
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending','Resolved'],
    default: 'Pending'
  },
  filePath: {
    type: String
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed
  }
  
});

const Report = mongoose.model('Reports', reportSchema, 'Reports');
module.exports = Report;
