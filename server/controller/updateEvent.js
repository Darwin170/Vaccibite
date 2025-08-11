const Event = require('../model/evenandprogram');

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start, end, details } = req.body;

    // Optional: Validate required fields if needed
    if (!title || !start || !end || !details) {
      return res.status(400).json({ message: 'Please fill out all fields.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        start,
        end,
        details,
      },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.status(200).json({ message: 'Event updated successfully.', event: updatedEvent });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event.' });
  }
};

module.exports = { updateEvent };