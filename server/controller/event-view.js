const Event = require('../model/evenandprogram'); 


const getEventViews = async (req, res) => {
    try {
        // Fetch all events, selecting ONLY the array that contains the unique user IDs
        const events = await Event.find({}).select('viewedByMobileUsers');

        // Calculate the total unique views by summing the length of the array for each event
        const totalUniqueMobileViews = events.reduce((acc, event) => {
            return acc + (event.viewedByMobileUsers ? event.viewedByMobileUsers.length : 0);
        }, 0);

        res.status(200).json({ count: totalUniqueMobileViews });
    } catch (err) {
        console.error("Error fetching event views:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getEventViews };
