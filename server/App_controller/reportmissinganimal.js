const multer = require('multer');
const Report = require('../model/reportsmodel');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const addMissinganimal = async (req, res) => {
  try {
    const {
      Name,
      barangayId, 
      animalType,
      color_breed,
      size,
      location,
      Date,
        Special
    } = req.body;

    const filePath = req.file ? req.file.originalname : null;

    const newReport = new Report({
      type: 'Missing Animal',
      barangayId, 
      date: new Date(),
      status: 'Pending',
      filePath,
      categoryDetails: {
        Name,
        animalType,
        color_breed,
        size,
        location,
        date,
        Special
      }
    });

    await newReport.save();
    res.status(201).json({ message: 'Missing Animal reported successfully', report: newReport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report Animal Bite', details: error.message });
  }
};

module.exports = {
  upload,
  addMissinganimal
};
