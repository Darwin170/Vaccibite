
const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");
const Barangay = require('../model/barangaymodel');

const addRoamingAnimal = async (req, res) => {
  try {
     const userIdFromMiddleware = req.MuserId;
    console.log("➡️ MuserId from middleware:", userIdFromMiddleware);
    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);
    const {
      Name_of_the_barangay_officer,
      barangayId, 
      animalType,
      color,
      breed,
      size,
      location,
      Time,
      bahavior
    } = req.body;

    // 🔑 NEW LOGIC: Fetch Barangay Name
    let barangayName = null;
    if (barangayId) {
        const barangayDoc = await Barangay.findById(barangayId).select('name');
        if (barangayDoc) {
            barangayName = barangayDoc.name;
            console.log("Fetched Barangay Name for Roaming Animal:", barangayName);
        } else {
            console.warn(`Barangay ID ${barangayId} not found for Roaming Animal report.`);
        }
    }

 // Save uploaded file path
   const filePath = req.file ? `uploads/${req.file.filename}` : null;

    const reportId = await generateId("report"); // <-- also log this
    console.log("Generated Report ID:", reportId);
    
    const newReport = new Report({
      type: 'Roaming Animal',
      userId: userIdFromMiddleware, 
      barangayId, 
      reportId,
      date: new Date(),
      status: 'Pending',
      filePath,
      // 🔑 NEW: Store the fetched name
      barangayName, 
      categoryDetails: {
        Name_of_the_barangay_officer,
        barangayId, // Re-added the ID so it can be formatted in the PDF table
        animalType,
        color,
        breed,
        size,
        location,
        Time,
        bahavior
      }
    });

    await newReport.save();
    res.status(201).json({ message: 'Roaming Animal reported successfully', report: newReport });
  } catch (error) {
    console.error("❌ Error in addRoamingAnimal:", error);
    let errorMessage = 'Failed to report Roaming Animal';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation failed: Check required fields and data types.';
    }
    res.status(500).json({ 
        error: errorMessage,
        details: error.message,
    });
  }
};
module.exports = {

  addRoamingAnimal
};












