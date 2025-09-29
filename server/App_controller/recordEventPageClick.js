const Event = require('../model/evenandprogram'); 
const ClickLog = require('../model/EventPageClicklog');

const recordEventPageClick = async (req, res) => {
    try {
        const mobileUserId = req.user._id;

        if (!mobileUserId) {
            return res.status(401).json({ message: 'Mobile user not authenticated.' });
        }

        // 💡 Use the new ClickLog model here
        const logEntry = new ClickLog({
            userId: mobileUserId,
        });

        await logEntry.save();

        res.status(201).json({ 
            message: 'Event page entry tracked successfully.',
            logId: logEntry._id
        });

    } catch (err) {
        console.error("Error recording event page click:", err);
        res.status(500).json({ message: 'Server error occurred while tracking page click.' });
    }
};

module.exports = {  
    recordEventPageClick
};
