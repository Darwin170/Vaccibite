const Report = require('../model/reportsmodel');

// Helper function to build MongoDB filter object based on all parameters
// Note: This helper is defined here for completeness but should ideally be shared 
// across all your controller files (e.g., in a separate utils/filterBuilder.js).
const buildFilter = (query) => {
    const { startMonth, endMonth, incidentType, district, barangayId } = query;
    const filter = {};

    // 1. Time Filter (Months)
    if (startMonth && endMonth) {
        const currentYear = new Date().getFullYear();
        filter.date = {
            $gte: new Date(currentYear, parseInt(startMonth) - 1, 1),
            $lte: new Date(currentYear, parseInt(endMonth), 0)
        };
    }
    
    // 2. Type Filter
    if (incidentType) {
        // Handle potential naming mismatch
        filter.incidentType = incidentType === 'Animal Roaming' ? 'Roaming Animal' ? 'Animal Bite': incidentType;
    }

    // 3. Location Filters
    if (district) {
        filter.district = district;
    }
    if (barangayId) {
        filter.barangayId = barangayId;
    }

    return filter;
};


const getResolvedReports = async (req, res) => {
    try {
        // 1. Build the general filters (time, location, type) from the request query
        const generalFilters = buildFilter(req.query);

        // 2. Apply the mandatory status filter for this specific API, merging it with others
        const finalFilter = {
            ...generalFilters, // Include month, type, district, barangay filters
            status: "Resolved" // Enforce "Resolved" status
        };

        // 3. Count documents matching ALL criteria
        const count = await Report.countDocuments(finalFilter);
        
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error("Error fetching resolved report count:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch resolved report count',
            error: error.message 
        });
    }
};

module.exports = { getResolvedReports };

