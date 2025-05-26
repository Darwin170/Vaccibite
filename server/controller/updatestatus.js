const  Report  = require('../model/reportsmodel'); // Assuming Report is your model

const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Assuming status is in the request body
  const file = req.file; // The uploaded file

  try {
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;

   
    if (file) {
     
      const filePath = `uploads/${file.originalname}`;
      report.filePath = filePath; // Store the file path in the database
     
    }

    await report.save();
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    res.status(200).json({ message: 'Report status updated successfully', report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Failed to update report status' });
  }
};


module.exports = { updateReportStatus };
