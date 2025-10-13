const report = require('../model/reportsmodel');
const mongoose = require('mongoose');

// Get reports from the last 28 days
const getLast28DaysReports = async (req, res) => {
      const { startMonth, endMonth, status, incidentType, district, barangayId } = query;
    const filter = {};

    // 1. Time Filter (Months) - Assumes reports have a 'date' field
    if (startMonth || endMonth) {
        // NOTE: This assumes filtering reports for a single, current year. 
        // For multi-year data, year filters are essential.
        const dateFilter = {};
        
        // Get the current year for time context
        const currentYear = new Date().getFullYear();

        if (startMonth) {
            // First day of the start month
            dateFilter.$gte = new Date(currentYear, parseInt(startMonth) - 1, 1);
        }
        if (endMonth) {
            // Last day of the end month
            dateFilter.$lte = new Date(currentYear, parseInt(endMonth), 0); // Month+1, Day 0 gives the last day of the previous month
        }
        
        if (Object.keys(dateFilter).length > 0) {
            filter.date = dateFilter;
        }
    }

    // 2. Status Filter
    if (status) {
        filter.status = status;
    }

    // 3. Type Filter
    if (incidentType) {
        // The frontend sends "Animal Roaming" but the DB might store "Roaming Animal"
        filter.incidentType = incidentType === 'Animal Roaming' ? 'Roaming Animal' : incidentType;
    }

    // 4. Location Filter
    if (district) {
        filter.district = district;
    }
    if (barangayId) {
        // Assuming your report schema links to the Barangay by ID
        filter.barangayId = barangayId;
    }

    return filter;
};
    try {
        // Calculate the date 28 days ago
        const today = new Date();
        const past28Days = new Date(today);
        past28Days.setDate(today.getDate() - 28);

        // Fetch reports with createdAt >= past28Days
        const reports = await report.find({ date: { $gte: past28Days } }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports from last 28 days',
            error: error.message
        });
    }
};

module.exports = { getLast28DaysReports };

