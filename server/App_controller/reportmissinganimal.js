const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");
const Barangay = require('../model/barangaymodel');

const addMissinganimal = async (req, res) => {
  
  try {
     const userIdFromMiddleware = req.MuserId;
    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file);
    console.log("➡️ User ID from middleware:", userIdFromMiddleware); 
    const {
      Name_of_the_barangay_officer,
      barangayId, 
      animalType,
      Name_of_the_animal_missing,
      color,
      breed,
      size,
      location,
      reportDate,  // ✅ renamed instead of "Date"
      Special,
        latitude, 
       longitude, 
    } = req.body;
        const type = 'Missing Animal';
    // 🔑 NEW LOGIC: Fetch Barangay Name
    let barangayName = null;
    if (barangayId) {
        const barangayDoc = await Barangay.findById(barangayId).select('name');
        if (barangayDoc) {
            barangayName = barangayDoc.name;
            console.log("Fetched Barangay Name for Missing Animal:", barangayName);
        } else {
            console.warn(`Barangay ID ${barangayId} not found for Missing Animal report.`);
        }
    }
          
 if (type === 'Missing Animal') {

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and Longitude are required for Animal Bite reports.' });
        }
        
        details = {
            latitude: latitude,
            longitude: longitude,
         
        };
    } 

    // ✅ Check required fields
    if (!barangayId || !Name_of_the_animal_missing) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Handle file path safely
    const filePath = req.file ? `uploads/${req.file.filename}` : null;


    const reportId = await generateId("report");
    console.log("Generated Report ID:", reportId);

    const newReport = new Report({
      reportId,
       userId: userIdFromMiddleware, 
      type: 'Missing Animal',
      barangayId,
      date: new Date(),
      status: 'Pending',
      filePath,
      // 🔑 NEW: Store the fetched name
      barangayName, 
      categoryDetails: {
      Name_of_the_barangay_officer,
      barangayId, // Re-added the ID so it can be formatted in the PDF table
      animalType,
      Name_of_the_animal_missing,
      color,
      breed,
      size,
      location,
      reportDate,  // ✅ renamed instead of "Date"
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








