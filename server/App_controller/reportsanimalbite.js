const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");

const addAnimalBite = async (req, res) => {
  try {
    // ➡️ This line gets the MuserId from your authentication middleware
    const MuserId = req.MuserId;

    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);
    console.log("➡️ MuserId from middleware:", MuserId); // Log it for verification

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
      age,
      gender,
      severity,
      caughtStatus
    } = req.body;

    // Save uploaded file path
    const filePath = req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null;

    const reportId = await generateId("report");
    console.log("Generated Report ID:", reportId);

    const newReport = new Report({
       reportId,
       MuserId, // ➡️ Add the MuserId to the new report document
      type: 'Animal Bite',
      barangayId,
      date: new Date(),
      status: 'Pending',
      filePath,
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
        age,
        gender,
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
    console.error("❌ Error in addAnimalBite:", error);
    res.status(500).json({
      error: 'Failed to report Animal Bite',
      details: error.message,
    });
  }
};

module.exports = { addAnimalBite };
