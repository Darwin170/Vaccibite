const Report = require('../model/reportsmodel');
// Assuming the following models/imports are available in your environment if needed
// const mongoose = require('mongoose'); 

// Helper function to build MongoDB filter object (defined only for this example's completeness)
const buildFilter = (query) => {
    const { startMonth, endMonth, status, incidentType, district, barangayId } = query;
    const filter = {};

    // 1. Time Filter (Months)
    if (startMonth && endMonth) {
        const currentYear = new Date().getFullYear();
        filter.date = {
            $gte: new Date(currentYear, parseInt(startMonth) - 1, 1),
            $lte: new Date(currentYear, parseInt(endMonth), 0)
        };
    }
    
    // NOTE: We SKIP the 'status' filter here because the main function explicitly sets it to "Ongoing".
    // Including it here would allow the user to override "Ongoing", which is counter-intuitive for this KPI.

    // 2. Type Filter
     if (incidentType) {
      matchQuery.type = incidentType;
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


const getOngoingReport = async (req, res) => {
    try {
        // 1. Build the general filters (time, location, type)
        const generalFilters = buildFilter(req.query);

        // 2. Apply the mandatory status filter for this specific API
        const finalFilter = {
            ...generalFilters,
            status: "Ongoing" 
        };

        // 3. Count documents matching ALL filters
        const count = await Report.countDocuments(finalFilter);
        
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error("Error fetching ongoing report count:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch ongoing report count',
            error: error.message 
        });
    }
};

module.exports = { getOngoingReport };


