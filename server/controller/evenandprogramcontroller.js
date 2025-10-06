const Event = require('../model/evenandprogram');
const ActivityLog = require('../model/Activitylogs');
const Notification = require('../model/Notification');
const M_User = require('../model/M_user'); // 🔑 CRITICAL: Import your Mobile User model

let io;
try {
    // Dynamically require/import the Socket.IO instance from your main server setup.
    io = require('../index').io;  
} catch (e) {
    console.warn("Socket.IO instance not found. Real-time notifications will be disabled.");
}

const createEvent = async (req, res) => {
    try {
        const { title, start, end, details, barangayId } = req.body; 

        if (!title || !start || !end || !details || !barangayId ) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        // 1. Create and Save the Event
        const newEvent = new Event({
            title,
            start: startDate,
            end: endDate,
            details,
            barangayId,
        });
        await newEvent.save();

        const notificationTitle = 'New Event Alert! 🎉';
        const notificationMessage = `The QCVD - ACDCD has posted a new event: "${newEvent.title}"`;
        
        // --- FAN-OUT BROADCAST LOGIC ---
        
        // A. 🔑 Fetch IDs of ALL mobile users
        const users = await M_User.find({}, '_id'); 
        
        // B. Create an array of notification documents, one for each user
        const notificationDocuments = users.map(user => ({
            title: notificationTitle,
            message: notificationMessage,
            senderId: req.user._id,
            userId: user._id, // ⬅️ Satisfies the 'required: true' constraint
            // We omit the 'isBroadcast' field as it is no longer needed.
        }));
        
        // C. 🔑 Insert all documents in bulk
        if (notificationDocuments.length > 0) {
            await Notification.insertMany(notificationDocuments);
        }
        
        // --- END FAN-OUT LOGIC ---

        // 3. Emit Real-Time Signal
        if (io) {
            // This emits to ALL connected users, ensuring they trigger a refresh.
            io.emit('new-event', {  
                type: 'BROADCAST',
                title: notificationTitle,
                message: notificationMessage,
                event: newEvent 
            });
        }
        
        // 4. Save Activity Log
        const newLog = new ActivityLog({
            user: req.user._id, 
            onModel: req.userType, 
            action: 'Event Created',
            details: `A new event "${title}" was created.`,
        });
        await newLog.save();

        // 5. Send Successful Response
        res.status(201).json({ 
            message: 'Event created successfully, and notification broadcasted to all users.', 
            event: newEvent 
        });
    } catch (error) {
        console.error('Create event error:', error.stack || error);
        res.status(500).json({ message: 'Server error creating event.' });
    }
};

// Delete Event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
      



        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Create an activity log
        const newLog = new ActivityLog({
           user: req.user._id, // admin ID
            onModel: req.userType, 
            action: 'Event Deleted',
            details: `Event "${deletedEvent.title}" was deleted.`,
        });

        await newLog.save();

        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Server error deleting event.' });
    }
};

// Get All Events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
};

module.exports = {
  createEvent,
  deleteEvent,
  getAllEvents,
};









