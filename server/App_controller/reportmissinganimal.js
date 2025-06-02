const multer = require('multer');
const Report = require('../model/reportsmodel'); // Assuming this path is correct
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
      dateMissing, // Renamed 'Date' to 'dateMissing' to avoid conflict
      Special
    } = req.body;

    const filePath = req.file ? req.file.originalname : null;

    // Validate and parse the incoming dateMissing string
    let parsedDateMissing;
    if (dateMissing) {
      // Assuming dateMissing comes in ISO 8601 format (YYYY-MM-DD) from Flutter
      parsedDateMissing = new Date(dateMissing);

      // Optional: Basic validation if the parsed date is valid
      if (isNaN(parsedDateMissing.getTime())) {
        return res.status(400).json({ error: 'Invalid Date Format', details: 'The provided dateMissing is not a valid date string.' });
      }
    } else {
        // Handle case where dateMissing is not provided if it's a required field
        return res.status(400).json({ error: 'Missing Date', details: 'dateMissing field is required.' });
    }

    const newReport = new Report({
      type: 'Missing Animal',
      barangayId,
      // This 'date' field is likely for the report's creation timestamp
      date: new Date(), // This is fine, it uses the global Date constructor
      status: 'Pending',
      filePath,
      categoryDetails: {
        Name,
        animalType,
        color_breed,
        size,
        location,
        date: parsedDateMissing, // Use the parsed Date object here
        Special
      }
    });

    await newReport.save();
    res.status(201).json({ message: 'Missing Animal reported successfully', report: newReport });
  } catch (error) {
    // It's good to log the actual error for debugging on the server
    console.error("Error in addMissinganimal:", error);
    res.status(500).json({ error: 'Failed to report Missing Animal', details: error.message });
  }
};

module.exports = {
  upload,
  addMissinganimal
};
