const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   MuserId: { 
    type: String, 
    required: true 
  },
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
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },
  password: {
    type: String,
    required: true,
  },
  barangay: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Barangays',                      
    required: true
  }

}, {
  timestamps: true
});

const M_User = mongoose.model('Mobile_User', userSchema);

module.exports = M_User;

