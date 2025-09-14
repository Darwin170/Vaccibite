const multer = require('multer');
const path = require('path');
const Report = require('../model/reportsmodel');



const addMissinganimal = async (req, res) => {
  try {
    const {
      
      Name_of_the_barangay_officer,
      barangayId, 
      animalType,
      Name_of_the_animal_missing,
      color,
      breed,
      size,
      location,
      Date,
        Special
    } = req.body;
  // Save uploaded file path
    const filePath = req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null;

    const reportId = await generateId("report"); // <-- also log this
    console.log("Generated Report ID:", reportId);


    const newReport = new Report({
      type: 'Missing Animal',
      reportId,
      barangayId, 
      date: new Date(),
      status: 'Pending',
      filePath,
      categoryDetails: {
        Name_of_the_barangay_officer,
        animalType,
        Name_of_the_animal_missing,
        color,
        breed,
        size,
        location,
        date,
        Special
      }
    });

    await newReport.save();
    res.status(201).json({ message: 'Missing Animal reported successfully', report: newReport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report Missing Animal'});
  }
};

module.exports = {
  upload,
  addMissinganimal
};



