const Event = require('../model/evenandprogram');
const ActivityLog = require('../model/Activitylogs');
// Create Event
const createEvent = async (req, res) => {
    try {
        const { title, start, end, details, barangayId,  } = req.body; // Added userId and onModel

        if (!title || !start || !end || !details || !barangayId ) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        const newEvent = new Event({
            title,
            start: startDate,
            end: endDate,
            details,
            barangayId,
        });

        await newEvent.save();
            if (io) {
           
            io.emit('new-event', { 
                type: 'NOTIFICATION',
                title: 'New Event Alert! 🎉',
                message: `The barangay has posted a new event: "${newEvent.title}"`,
                event: newEvent 
            });
        }
        const newLog = new ActivityLog({
            user: req.user._id, 
            onModel: req.userType, 
            action: 'Event Created',
            details: `A new event "${title}" was created.`,
        });

        await newLog.save();

        res.status(201).json({ message: 'Event created successfully.', event: newEvent });
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

