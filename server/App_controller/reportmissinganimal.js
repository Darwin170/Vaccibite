const multer = require('multer');
const path = require('path');
const Report = require('../model/reportsmodel');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, PDF, DOC, DOCX files are allowed!'));
    }
  }
});


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
    res.status(500).json({ error: 'Failed to report Animal Bite'});
  }
};

module.exports = {
  upload,
  addMissinganimal
};
