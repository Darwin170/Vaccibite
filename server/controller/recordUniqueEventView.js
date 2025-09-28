
const Event = require('../model/evenandprogram'); 

const recordUniqueEventView = async (req, res) => {
    try {
        const eventId = req.params.id; // Get the ID of the event being viewed
        
        const mobileUserId = req.user._id; 
        
        if (!mobileUserId) {
             return res.status(401).json({ message: 'Mobile user not authenticated.' });
        }
        
        // Use $addToSet to add the user ID to the array only if it's unique
        const result = await Event.findByIdAndUpdate(
            eventId,
            { 
                $addToSet: { viewedByMobileUsers: mobileUserId }
            },
            { new: true, select: 'viewedByMobileUsers' } // Return the updated array for checking
        );

        if (!result) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Return a simple success status. The unique view is recorded.
        res.status(200).json({ 
            message: 'Unique view recorded.',
            uniqueViewCount: result.viewedByMobileUsers.length // Optional: return the new count
        });

    } catch (err) {
        console.error("Error recording unique view:", err);
        res.status(500).json({ message: 'Server error occurred while tracking view.' });
    }
};

module.exports = { recordUniqueEventView };
