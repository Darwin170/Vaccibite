const report = require('../model/reportsmodel');
const mongoose = require('mongoose');

// Get reports from the last 28 days
const getLast28DaysReports = async (req, res) => {
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
