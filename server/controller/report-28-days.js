const report = require('../model/reportsmodel');
const mongoose = require('mongoose');

// Helper function to build non-date-specific filters (Location, Status, Type)
const buildGeneralFilters = (query) => {
    // Destructure query parameters
    const { status, incidentType, district, barangayId } = query;
    const filter = {};

    // 1. Status Filter
    if (status) {
        filter.status = status;
    }

    // 2. Type Filter
     if (incidentType) {
      matchQuery.type = incidentType;
    }

    // 3. Location Filter
    if (district) {
        filter.district = district;
    }
    if (barangayId) {
        // Assuming your report schema links to the Barangay by ID
        filter.barangayId = barangayId;
    }

    return filter;
};

// Get reports from the last 28 days
const getLast28DaysReports = async (req, res) => {
    try {
        // 1. Get all query parameters from the request
        const query = req.query;
        
        // 2. Define the mandatory 28-day time filter
        const past28Days = new Date();
        past28Days.setDate(past28Days.getDate() - 28);

        // 3. Build the general filters (Status, Type, Location)
        const generalFilters = buildGeneralFilters(query);
        
        // 4. Combine general filters with the 28-day time constraint
        // This ensures the count reflects the last 28 days AND the user's selected location/type.
        const finalFilter = {
            ...generalFilters, 
            date: { $gte: past28Days }
        };

        // 5. Execute the Query
        // Use the finalFilter to restrict the documents
        const reports = await report.find(finalFilter).sort({ date: -1 });

        res.status(200).json({
            success: true,
            // Return the count of matching reports for the frontend KPI
            count: reports.length, 
            data: reports // Optionally return the data itself
        });
    } catch (error) {
        console.error("Error fetching last 28 days reports:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports from last 28 days',
            error: error.message
        });
    }
};

module.exports = { getLast28DaysReports };

