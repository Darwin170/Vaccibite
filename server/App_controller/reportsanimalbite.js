const multer = require('multer');
const Report = require('../model/reportsmodel');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const addAnimalBite = async (req, res) => {
  try {
    const {
      Name,
      barangayId, 
      animalType,
      color,
      size,
      severity,
      caughtStatus
    } = req.body;

    const filePath = req.file ? req.file.originalname : null;

    const newReport = new Report({
      type: 'Animal Bite',
      barangayId, 
      date: new Date(),
      status: 'Pending',
      filePath,
      categoryDetails: {
        Name,
        animalType,
        color,
        size,
        severity,
        caughtStatus
      }
    });

    await newReport.save();
    res.status(201).json({ message: 'Animal Bite reported successfully', report: newReport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report Animal Bite', details: error.message });
  }
};

module.exports = {
  upload,
  addAnimalBite
};
