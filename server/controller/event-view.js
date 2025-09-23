const Event = require('../model/evenandprogram'); // Your Event model

const getEventViews = async (req, res) => {
  try {
    // Count total views for all events
    // Assuming your Event schema has a field "views" that tracks views per event
    const events = await Event.find({});
    const totalViews = events.reduce((acc, event) => acc + (event.views || 0), 0);

    res.status(200).json({ count: totalViews });
  } catch (err) {
    console.error("Error fetching event views:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports={getEventViews}