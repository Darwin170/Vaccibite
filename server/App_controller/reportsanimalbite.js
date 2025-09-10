const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");



const addAnimalBite = async (req, res) => {
  try {
    const {
      Name_of_the_barangay_officer,
      barangayId,
      Name_Of_the_bitten_Person,
      animalType,
      color,
      size,
      location,
      location_of_bite,
      street,
      severity,
      caughtStatus
    } = req.body;

    // Save uploaded file path
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const reportId = await generateId("report");


    const newReport = new Report({
      type: 'Animal Bite',
      barangayId, 
      date: new Date(),
      status: 'Pending',
      filePath, // This will be used for download/view
      categoryDetails: {
        Name_of_the_barangay_officer,
        barangayId,
        Name_Of_the_bitten_Person,
        animalType,
        color,
        size,
        location,
        location_of_bite,
        street,
        severity,
        caughtStatus
      }
    });

    await newReport.save();
    res.status(201).json({
      message: 'Animal Bite reported successfully',
      report: newReport
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to report Animal Bite',
    });
  }
};

module.exports = {
  addAnimalBite
};







