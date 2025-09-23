const Event = require('../model/evenandprogram');

// 1. Import the ActivityLog model
const ActivityLog = require('../model/Activitylogs');

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
  const { title, start, end, details} = req.body; 

    // Optional: Validate required fields
    if (!title || !start || !end || !details ) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        start,
        end,
        details,
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // 2. Create the activity log here
    const newLog = new ActivityLog({
      user: req.user._id, // admin ID
      onModel: req.userType, 
      action: 'Event Updated',
      details: `Event "${updatedEvent.title}" updated by user with ID .${req.user._id}`,
    });
    
    // 3. Save the log to the database
    await newLog.save();

    res.status(200).json({ message: 'Event updated successfully.', event: updatedEvent });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event.' });
  }
};

module.exports = { updateEvent };