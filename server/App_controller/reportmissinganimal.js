const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");

const addMissinganimal = async (req, res) => {
  
  try {
     const MuserId = req.MuserId;
    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);
    console.log("➡️ MuserId from middleware:", MuserId);
    const {
      Name_of_the_barangay_officer,
      barangayId, 
      animalType,
      Name_of_the_animal_missing,
      color,
      breed,
      size,
      location,
      reportDate,  // ✅ renamed instead of "Date"
      Special
    } = req.body;

    // ✅ Check required fields
    if (!barangayId || !Name_of_the_animal_missing) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Handle file path safely
    const filePath = req.file 
      ? `${process.env.BASE_URL}/uploads/${req.file.filename}`
      : null;

    const reportId = await generateId("report");
    console.log("Generated Report ID:", reportId);

    const newReport = new Report({
      reportId,
      MuserId, 
      type: 'Missing Animal',
      barangayId,
      date: new Date(),
      status: 'Pending',
      filePath,
      categoryDetails: {
      Name_of_the_barangay_officer,
      barangayId, 
      animalType,
      Name_of_the_animal_missing,
      color,
      breed,
      size,
      location,
      reportDate,  // ✅ renamed instead of "Date"
      Special
      }
    });

    await newReport.save();

    res.status(201).json({
      message: 'Missing Animal reported successfully',
      report: newReport
    });
  } catch (error) {
    console.error("❌ Error in addMissinganimal:", error.stack);
    res.status(500).json({
      error: 'Failed to report Missing Animal',
      details: error.message,
    });
  }
};

module.exports = { addMissinganimal };



