const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  barangay: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Barangay',                      
    required: true
  }
}, {
  timestamps: true
});

const M_User = mongoose.model('Mobile_User', userSchema);

module.exports = M_User;
