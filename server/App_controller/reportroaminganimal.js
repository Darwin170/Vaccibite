const multer = require('multer');
const Report = require('../model/reportsmodel');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const addRoamingAnimal = async (req, res) => {
  try {
    const {
      Name,
      barangayId, 
      animalType,
      color_breed,
      size,
      location,
      Time,
        bahavior
    } = req.body;

    const filePath = req.file ? req.file.originalname : null;

    const newReport = new Report({
      type: 'Roaming Animal',
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
        Time,
        bahavior
      }
    });

    await newReport.save();
    res.status(201).json({ message: 'Roaming Animal reported successfully', report: newReport });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report Animal Roaming', details: error.message });
  }
};

module.exports = {
  upload,
  addRoamingAnimal
};
