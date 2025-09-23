const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

  reportId: { 
    type: String, 
    required: true, 
    unique: true
  },
    

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
    enum: ['Pending','Ongoing','Resolved'],
    default: 'Pending'
  },
  filePath: {
    type: String
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed
  },
   userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'M_User' }
  
},);

const Report = mongoose.model('Reports', reportSchema, 'Reports');
module.exports = Report;
