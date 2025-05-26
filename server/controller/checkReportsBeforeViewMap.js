const Report = require('../model/reportsmodel');

const checkReportsBeforeViewMap = async (req, res) => {
    try {
      const reports = await Report.find();
  
      if (reports.length === 0) {
        return res.status(400).json({ message: 'No reports available. Please create a report before viewing the map.' });
      }
  
      // If there are reports, send them along with barangay coordinates
      const reportsWithBarangay = await Promise.all(reports.map(async (report) => {
        const barangay = await Barangay.findById(report.barangayId);
        return {
          reportId: report._id,
          type: report.type,
          date: report.date,
          status: report.status,
          filePath: report.filePath,
          barangay: {
            id: barangay._id,
            name: barangay.name,
            latitude: barangay.latitude,
            longitude: barangay.longitude,
            radius: barangay.radius
          }
        };
      }));
  
      res.status(200).json(reportsWithBarangay);
    } catch (error) {
      console.error('Error fetching reports for map:', error);
      res.status(500).json({ message: 'Server error while fetching reports for map.' });
    }
  };
  module.exports = { checkReportsBeforeViewMap };
