const Report = require('../model/reportsmodel');
const ArchivedReport = require('../model/ArchivingReportsmodel'); 
const ActivityLog = require('../model/Activitylogs'); // Import the ActivityLog model

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the report first
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Archive the report
    await ArchivedReport.create(report.toObject());

    // Delete from the original collection
    await Report.findByIdAndDelete(id);

    // Create the activity log here
    const newLog = new ActivityLog({
      user: req.user._id, // admin ID
      onModel: req.userType,
      action: 'Report Archived',
      details: `Report with ID ${id} was archived and deleted by a user.`,
    });

    await newLog.save();

    res.status(200).json({ message: 'Report archived and deleted successfully.' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error archiving and deleting report.' });
  }
};

module.exports = { deleteReport };