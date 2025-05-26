const Report = require('../model/reportsmodel');
const Barangay = require('../model/barangaymodel');
const path = require('path');
const fs = require('fs');

const createReport = async (req, res) => {
  try {
    const { type, barangayId, date, status } = req.body;
    const file = req.file;

    if (!type || !barangayId || !date || !file) {
      return res.status(400).json({ message: 'Please fill all required fields and upload a file.' });
    }

    const barangayExists = await Barangay.findById(barangayId);
    if (!barangayExists) {  
      return res.status(404).json({ message: 'Barangay not found.' });
    }

    // Store the file
    const filePath = path.join('uploads', file.originalname);
    fs.writeFileSync(filePath, file.buffer); // Save file locally

    const newReport = new Report({
      type,
      barangayId,
      date,
      status,
      filePath
    });

    await newReport.save();

    // Send the report along with Barangay location (latitude and longitude)
    res.status(201).json({ 
      message: 'Report created successfully.',
      report: newReport,
      barangay: {
        id: barangayExists._id,
        name: barangayExists.name,
        latitude: barangayExists.latitude,
        longitude: barangayExists.longitude
      }
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error while creating report.' });
  }
};

module.exports = { createReport };
