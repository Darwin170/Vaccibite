const Event = require('../model/evenandprogram'); 

const getEventViews = async (req, res) => {
    try {
        const aggregationResult = await Event.aggregate([
            // 1. Unwind: Deconstruct the array to create a document for every single view
            {
                $unwind: '$viewedByMobileUsers'
            },
            // 2. Group: Group all documents by the user ID. This automatically finds the DISTINCT users.
            {
                $group: {
                    _id: '$viewedByMobileUsers' // The result is a list of unique user IDs
                }
            },
            // 3. Count: Count the number of unique user IDs found in the previous stage
            {
                $count: 'totalUniqueUsers' 
            }
        ]);

        // Extract the final count or default to 0
        const totalCount = aggregationResult.length > 0 ? aggregationResult[0].totalUniqueUsers : 0;

        res.status(200).json({ 
            count: totalCount,
            message: 'Total distinct event viewers fetched successfully.'
        });

    } catch (err) {
        console.error("Error fetching distinct event views:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getEventViews };
