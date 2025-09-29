// model/EventPageClickLog.js

const mongoose = require('mongoose');

const EventPageClickLogSchema = new mongoose.Schema({
    // Store the ID of the user who performed the click
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mobile_User', // Reference to your mobile user model
        required: true,
    },
    // The timestamp of when the click occurred
    clickTime: {
        type: Date,
        default: Date.now,
    },
    // Optional: A field to identify what page was clicked (useful if you track other pages)
    clickType: {
        type: String,
        default: 'EVENTS_PAGE_ENTRY',
    }
});

module.exports = mongoose.model('EventPageClickLog', EventPageClickLogSchema);
