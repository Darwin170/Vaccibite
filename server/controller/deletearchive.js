const ArchivedReport = require('../model/ArchivingReportsmodel'); 
const ActivityLog = require('../model/Activitylogs'); // Import the ActivityLog model

const deleteArchivedReport = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await ArchivedReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }
      await ArchivedReport.findByIdAndDelete(id);

    // Create the activity log here
    const newLog = new ActivityLog({
      user: req.user._id, // admin ID
      onModel: req.userType,
      action: 'Archived Report Deleted',
      details: `Archived report with ID ${id} was permanently deleted.`,
    });

    await newLog.save();

    res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { deleteArchivedReport };