// reportController.js
const Report = require('../model/reportsmodel'); 
const Barangays = require('../model/barangaymodel'); 

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({}) 
      .populate({
        path: 'barangayId', 
        select: 'name district latitude longitude' 
      })
      .sort({ date: -1 });

    const reportsToSend = reports.map(report => ({
      _id: report._id,  
      type: report.type,
      reportId: report.reportId,
      barangayId: report.barangayId ? report.barangayId._id : null,
      barangayName: report.barangayId ? report.barangayId.name : 'Unknown',
      district: report.barangayId ? report.barangayId.district : 'N/A', 
      
      date: report.date,
      status: report.status,
      filePath: report.filePath,
      categoryDetails: report.categoryDetails,
      latitude: report.barangayId ? report.barangayId.latitude : null,
      longitude: report.barangayId ? report.barangayId.longitude : null,
    }));

    res.json(reportsToSend);
    console.log(reportsToSend); 

  } catch (err) {
    console.error('Error in getAllReports:', err); 
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

module.exports = { getAllReports };
