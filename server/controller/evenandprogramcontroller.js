const Event = require('../model/evenandprogram');

// Create Event
const createEvent = async (req, res) => {
  try {
    const { title, start, end, details } = req.body;

    // Validate required fields
    if (!title || !start || !end || !details) {
      return res.status(400).json({ message: 'Please fill out all fields.' });
    }

    // Convert start and end to Date objects explicitly
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    const newEvent = new Event({
      title,
      barangayId,
      start: startDate,
      end: endDate,
      details,
    });

    await newEvent.save();

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
