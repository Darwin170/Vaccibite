const Report = require('../model/reportsmodel');
const Location = require('../model/barangaymodel');
const mongoose = require('mongoose');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getMonthNumber = (month) => parseInt(month, 10);

const buildMatchCriteria = (query) => {
    const { startMonth, endMonth, incidentType, district, barangayId, status } = query;

    const criteria = {};

    if (status) { criteria.status = status; }
    if (incidentType) { criteria.incidentType = incidentType; }
    if (district) { criteria.district = district; }
    
    if (barangayId) {
        criteria.barangayId = mongoose.Types.ObjectId.isValid(barangayId)
                               ? new mongoose.Types.ObjectId(barangayId)
                               : barangayId;
    } 
    if (startMonth && endMonth && (startMonth !== '1' || endMonth !== '12')) {
        criteria.$expr = {
            $and: [
                { $gte: [{ $month: '$created_at' }, getMonthNumber(startMonth)] },
                { $lte: [{ $month: '$created_at' }, getMonthNumber(endMonth)] }
            ]
        };
    }

    return criteria;
};
exports.getAverageResolutionTime = async (req, res) => {
    try {
        const matchCriteria = buildMatchCriteria(req.query);

        // Enforce the calculation criteria: status must be Resolved, and timestamps must exist
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
                    // Divide milliseconds by MS_PER_DAY to get average days
                    averageTime: { $avg: { $divide: ["$duration_ms", MS_PER_DAY] } }
                }
            }
        ];

        const result = await Report.aggregate(pipeline);

        if (result.length > 0 && result[0].averageTime !== undefined) {
            const averageTime = parseFloat(result[0].averageTime).toFixed(1);
            return res.json({ averageTime });
        } else {
            // Return '0.0' or 'N/A' if no resolved reports meet the criteria
            return res.json({ averageTime: '0.0' });
        }

    } catch (err) {
        console.error("Error calculating average resolution time:", err);
        res.status(500).json({ message: "Server error during calculation" });
    }
};
