const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");

const addAnimalBite = async (req, res) => {
  try {
    // ➡️ Safely get the user ID from your authentication middleware.
    // We use 'userIdFromMiddleware' for clarity, but it holds the same value as req.MuserId.
    const userIdFromMiddleware = req.MuserId;

    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);
    console.log("➡️ User ID from middleware:", userIdFromMiddleware); 

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
    // Note: Ensure process.env.BASE_URL is defined if you use it for the file path
    const filePath = req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null;

    const reportId = await generateId("report");
    console.log("Generated Report ID:", reportId);

    const newReport = new Report({
       reportId,
       // 🎯 FIX: Use the key 'userId' to match the Mongoose schema requirement.
       userId: userIdFromMiddleware, 
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
    // Send back a clearer error message to help the client developer
    let errorMessage = 'Failed to report Animal Bite';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation failed: Check required fields and data types.';
    }
    res.status(400).json({
      error: errorMessage,
      details: error.message,
    });
  }
};

module.exports = { addAnimalBite };
