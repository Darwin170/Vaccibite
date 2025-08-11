// reportController.js
const Report = require('../model/reportsmodel'); // Your Report model
const Barangay = require('../model/barangaymodel'); // Make sure you also require your Barangay model

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({}) // Fetch all reports
      .populate({
        path: 'barangayId', // Specify the field to populate
        select: 'name district latitude longitude' // Select the fields you need from the Barangay document
                                                 // Crucially, 'district' is included here
      })
      .sort({ createdAt: -1 }); // Optional: sort by creation date, newest first

    // Map the reports to a new array, flattening the 'barangayId' object
    // to include 'barangayName' and 'district' directly on the report object.
    const reportsToSend = reports.map(report => ({
      _id: report._id,
      type: report.type,
      // The original barangayId ObjectId (if your frontend needs it for filtering/forms)
      barangayId: report.barangayId ? report.barangayId._id : null,
      // These come from the populated 'barangayId' object
      barangayName: report.barangayId ? report.barangayId.name : 'Unknown',
      district: report.barangayId ? report.barangayId.district : 'N/A', // <-- This is where the district comes from!
      // Other report fields
      date: report.date,
      status: report.status,
      filePath: report.filePath,
      categoryDetails: report.categoryDetails,
      // You can also add latitude and longitude here if the map button needs them
      latitude: report.barangayId ? report.barangayId.latitude : null,
      longitude: report.barangayId ? report.barangayId.longitude : null,
    }));

    res.json(reportsToSend);
    console.log(reportsToSend); // Log the data being sent to the frontend for debugging

  } catch (err) {
    console.error('Error in getAllReports:', err); // Log the full error
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

module.exports = { getAllReports };
