const Report = require('../model/reportsmodel');
const Barangay = require('../model/barangaymodel'); // 🔑 NEW: Assuming this is the path to your Barangay model
const generateId = require("../utils/generateId");

const addAnimalBite = async (req, res) => {
  try {
    const userIdFromMiddleware = req.MuserId;

    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);
    console.log("➡️ User ID from middleware:", userIdFromMiddleware); 

    const {
      Name_of_the_barangay_officer,
      barangayId, // <--- This holds the ID (e.g., "65b8d2...")
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

    // 🔑 Keep fetching the name for the main report object display
    let barangayName = null;
    if (barangayId) {
        const barangayDoc = await Barangay.findById(barangayId).select('name');
        if (barangayDoc) {
            barangayName = barangayDoc.name;
            console.log("Fetched Barangay Name:", barangayName);
        } else {
            console.warn(`Barangay ID ${barangayId} not found.`);
        }
    }


    // Save uploaded file path
    const filePath = req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null;

    const reportId = await generateId("report");
    console.log("Generated Report ID:", reportId);

    const newReport = new Report({
       reportId,
       userId: userIdFromMiddleware, 
      type: 'Animal Bite',
      barangayId, // Keep the ID for relational integrity (main object)
      date: new Date(),
      status: 'Pending',
      filePath,
    
        // Store the name for easy display in tables/lists
        barangayName, 

      categoryDetails: {
        Name_of_the_barangay_officer,
        barangayId, // 🔑 CHANGE: Re-added the barangayId field here for the table.
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
