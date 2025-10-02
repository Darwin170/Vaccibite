const Event = require('../model/evenandprogram');
const mongoose = require('mongoose');

// Assuming your User model is available and its collection is 'users'
// You might need to import the User model if it's used elsewhere for schema reference
// const User = require('../model/user'); 

const getEventViews = async (req, res) => {
    try {
        // 1. Read the barangayId from the query parameters
        const { barangayId } = req.query;

        // --- Stage 1: Initial Filter (Optional but good for performance) ---
        // If you want to only include events that have views, you can keep a simple match here.
        let initialMatch = { 'viewedByMobileUsers.0': { $exists: true } };

        // --- Stages 2-6: The Main Aggregation Pipeline ---
        const pipeline = [
            // Filter to include only documents with views
            { $match: initialMatch },

            // 1. Unwind: Deconstruct the array to create a document for every single view
            {
                $unwind: '$viewedByMobileUsers'
            },
            
            // 2. Lookup (Join): Get the user document associated with the viewer ID
            {
                $lookup: {
                    from: 'users', // Replace 'users' with the actual name of your User collection
                    localField: 'viewedByMobileUsers',
                    foreignField: '_id',
                    as: 'viewerDetails'
                }
            },
            
            // 3. Unwind viewerDetails: Deconstruct the viewerDetails array (should be size 1 or 0)
            {
                $unwind: {
                    path: '$viewerDetails',
                    preserveNullAndEmptyArrays: false // Only proceed if user details are found
                }
            },
            
            // 4. Match (Filter by Barangay): Apply the requested filter
            // Note: We only filter if a barangayId was actually passed in the request
            ...(barangayId ? [{
                $match: {
                    // Assuming the user document has a field called 'barangayId' or 'barangay'
                    'viewerDetails.barangayId': new mongoose.Types.ObjectId(barangayId) 
                    // Use 'barangay' if your User model field is named 'barangay'
                }
            }] : []), 

            // 5. Group: Group by the user ID again (since filtering may have removed some)
            // This ensures we count only the DISTINCT users who passed the filter.
            {
                $group: {
                    _id: '$viewedByMobileUsers' 
                }
            },
            
            // 6. Count: Count the number of unique user IDs found
            {
                $count: 'totalUniqueUsers' 
            }
        ];

        const aggregationResult = await Event.aggregate(pipeline);

        // Extract the final count or default to 0
        const totalCount = aggregationResult.length > 0 ? aggregationResult[0].totalUniqueUsers : 0;

        res.status(200).json({
            count: totalCount,
            message: `Total distinct event viewers fetched successfully, filtered by barangay: ${barangayId || 'None'}.`
        });

    } catch (err) {
        console.error("Error fetching distinct event views:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getEventViews };
