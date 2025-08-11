const mongoose = require('mongoose');

const barangaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true
  }
});

const Barangay = mongoose.model('Barangays', barangaySchema,'barangays' );
module.exports = Barangay;
