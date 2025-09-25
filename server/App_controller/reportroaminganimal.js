
const Report = require('../model/reportsmodel');
const generateId = require("../utils/generateId");

const addRoamingAnimal = async (req, res) => {
  try {
     const MuserId = req.MuserId;
     console.log("➡️ MuserId from middleware:", MuserId);
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

 // Save uploaded file path
    const filePath = req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null;

    const reportId = await generateId("report"); // <-- also log this
    console.log("Generated Report ID:", reportId);
    const newReport = new Report({
      type: 'Roaming Animal',
      MuserId,
      barangayId, 
      reportId,
      date: new Date(),
      status: 'Pending',
      filePath,
      categoryDetails: {
        Name_of_the_barangay_officer,
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
    res.status(500).json({ error: 'Failed to report Animal Bite' });
  }
};

module.exports = {

  addRoamingAnimal
};







