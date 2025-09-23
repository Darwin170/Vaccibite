const Report = require('../model/reportsmodel');
const Barangay = require('../model/barangaymodel');
const path = require('path');
const generateId = require('../utils/generateId');

// 1. Import the ActivityLog model
const ActivityLog = require('../model/Activitylogs');

const createReport = async (req, res) => {
    try {
        // Add userId and onModel to the request body destructuring
        const { type, barangayId, date, status, district, categoryDetails, } = req.body;
        const file = req.file;

        if (!type || !barangayId || !date || !status || !district || !file ) {
            return res.status(400).json({ message: 'Please fill all required general fields and upload a file.' });
        }

        const barangayExists = await Barangay.findById(barangayId);
        if (!barangayExists) {
            return res.status(404).json({ message: 'Barangay not found.' });
        }

        const filePath = path.join('uploads', file.filename);

        let parsedCategoryDetails = {};
        try {
            if (categoryDetails) {
                parsedCategoryDetails = JSON.parse(categoryDetails);
            }
        } catch (parseError) {
            console.error('Error parsing categoryDetails:', parseError);
            return res.status(400).json({ message: 'Invalid format for category details.' });
        }

        const reportId = await generateId("report");

        const newReport = new Report({
            reportId,
            type,
            barangayId,
            date,
            status,
            district,
            filePath,
            categoryDetails: parsedCategoryDetails
        });

        await newReport.save();

        // 2. Create the activity log here
        const newLog = new ActivityLog({
            user: req.user._id, // admin ID
            onModel: req.userType,
            action: 'New Report Created',
            details: `A new report (ID: ${newReport.reportId}) was created by a user.`,
        });

        await newLog.save(); // 3. Save the new log

        res.status(201).json({
            message: 'Report created successfully.',
            report: newReport,
            barangay: {
                id: barangayExists._id,
                name: barangayExists.name,
                latitude: barangayExists.latitude,
                longitude: barangayExists.longitude,
                district: barangayExists.district
            }
        });
    } catch (error) {
        console.error('Error creating report:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error while creating report.' });
        }
    }
};

module.exports = { createReport };