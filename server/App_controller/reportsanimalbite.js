const multer = require('multer');
const path = require('path');
const Report = require('../model/reportsmodel');

// Store files in uploads/ with unique name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Accept images & documents
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

const addAnimalBite = async (req, res) => {
  try {
    const {
      Name,
      barangayId, 
      animalType,
      color,
      size,
      location,
      severity,
      caughtStatus
    } = req.body;

    // Save uploaded file path
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newReport = new Report({
      type: 'Animal Bite',
      barangayId, 
      date: new Date(),
      status: 'Pending',
      filePath, // This will be used for download/view
      categoryDetails: {
        Name,
        animalType,
        color,
        size,
        location,
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
    res.status(500).json({
      error: 'Failed to report Animal Bite',
    });
  }
};

module.exports = {
  upload, // multer middleware
  addAnimalBite
};
