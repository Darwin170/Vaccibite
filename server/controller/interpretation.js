const Report = require('../model/reportsmodel');
const mongoose = require('mongoose');

// Utility functions and constants
const getMonthNumber = (month) => parseInt(month, 10);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Controller function to calculate the average number of days it takes to resolve a report.
 */
const getAverageResolutionTime = async (req, res) => {
    try {
        const { startMonth, endMonth, incidentType, district, barangayId } = req.query;

        const matchCriteria = {
            status: "Resolved",
            created_at: { $exists: true },
            resolved_at: { $exists: true }
        };

        // --- Apply Filters ---
        if (startMonth && endMonth) {
            matchCriteria.$expr = {
                $and: [
                    { $gte: [{ $month: '$created_at' }, getMonthNumber(startMonth)] },
                    { $lte: [{ $month: '$created_at' }, getMonthNumber(endMonth)] }
                ]
            };
        }
        if (incidentType) {
            matchCriteria.incidentType = incidentType;
        }
        if (district) {
            matchCriteria.district = district;
        }
        if (barangayId) {
            matchCriteria.barangayId = mongoose.Types.ObjectId.isValid(barangayId) 
                                       ? new mongoose.Types.ObjectId(barangayId) 
                                       : barangayId;
        }
        
        // --- MongoDB Aggregation Pipeline ---
        const pipeline = [
            { $match: matchCriteria },
            {
                $addFields: {
                    duration_ms: { $subtract: ["$resolved_at", "$created_at"] }
                }
            },
            {
                $addFields: {
                    resolution_days: { 
                        $divide: ["$duration_ms", MS_PER_DAY] 
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageTime: { $avg: "$resolution_days" }
                }
            }
        ];

        // --- Execute and Respond ---
        const result = await Report.aggregate(pipeline);

        if (result.length > 0) {
            const averageTime = result[0].averageTime !== undefined 
                ? parseFloat(result[0].averageTime).toFixed(1) 
                : '0.0';
                
            return res.json({ averageTime });
        } else {
            return res.json({ averageTime: '0.0' }); 
        }

    } catch (err) {
        console.error("Error calculating average resolution time:", err);
        // Delegate error handling to the Express middleware/client
        res.status(500).json({ message: "Server error during calculation" });
    }
};

module.exports = { getAverageResolutionTime };
