const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  details: { type: String, default: '' },
});

module.exports = mongoose.model('Event', EventSchema);
