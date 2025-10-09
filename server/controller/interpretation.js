const Report = require('../model/reportsmodel');
const mongoose = require('mongoose');

const getMonthNumber = (month) => parseInt(month, 10);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getAverageResolutionTime = async (req, res) => {
    try {
        // Only accept month parameters
        const { startMonth, endMonth, incidentType, district, barangayId } = req.query;
        
        // Define the current year for filtering
        const currentYear = new Date().getFullYear(); 

        const matchCriteria = {
            status: "Resolved",
            created_at: { $exists: true },
            resolved_at: { $exists: true }
        };

        // ------------------------------------
        // --- Filter by Month AND Current Year ---
        // ------------------------------------
        if (startMonth && endMonth) {
            // Determine the start and end dates based on the current year
            // Start Date: First day of startMonth in the current year
            const startDate = new Date(currentYear, getMonthNumber(startMonth) - 1, 1);
            
            // End Date: Last millisecond of endMonth in the current year
            const endDate = new Date(currentYear, getMonthNumber(endMonth), 0); 
            endDate.setHours(23, 59, 59, 999); 
            
            if (!isNaN(startDate) && !isNaN(endDate)) {
                matchCriteria.created_at = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }
        
        // ... (rest of the filters and aggregation pipeline remain the same) ...
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
        
        // --- MongoDB Aggregation Pipeline --- (remains unchanged)
        const pipeline = [
            { $match: matchCriteria },
            { $addFields: { duration_ms: { $subtract: ["$resolved_at", "$created_at"] } } },
            { $addFields: { resolution_days: { $divide: ["$duration_ms", MS_PER_DAY] } } },
            { $group: { _id: null, averageTime: { $avg: "$resolution_days" } } }
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

module.exports = { getAverageResolutionTime };
