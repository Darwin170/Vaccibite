const Report = require('../models/reportsmodel');
const mongoose = require('mongoose');



const MS_PER_DAY = 1000 * 60 * 60 * 24;

exports.getAverageResolutionTime = async (req, res) => {
    try {
        const matchCriteria = buildMatchCriteria(req.query);

        matchCriteria.status = "Resolved";
        
        matchCriteria.created_at = { $exists: true };
        matchCriteria.resolved_at = { $exists: true }; 

        const pipeline = [
            { $match: matchCriteria },
            {
                $addFields: {
                    duration_ms: { $subtract: ["$resolved_at", "$created_at"] }
                }
            },
            {

                $group: {
                    _id: null,

                    averageTime: { $avg: { $divide: ["$duration_ms", MS_PER_DAY] } }
                }
            }
        ];

        // --- Execute and Respond ---
        const result = await Report.aggregate(pipeline);

        if (result.length > 0 && result[0].averageTime !== undefined) {
            const averageTime = parseFloat(result[0].averageTime).toFixed(1); 
            return res.json({ averageTime });
        } else {
            return res.json({ averageTime: '0.0' }); 
        }

    } catch (err) {
        console.error("Error calculating average resolution time:", err);
        res.status(500).json({ message: "Server error during calculation" });
    }
};
