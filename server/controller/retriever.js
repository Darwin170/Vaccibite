const Report = require('../model/reportsmodel');
const ArchivedReport = require('../model/ArchivingReportsmodel');
const ActivityLog = require('../model/Activitylogs');

const retrieveReport = async (req, res) => {
  const { id } = req.params;
  

  try {
    const archived = await ArchivedReport.findById(id);
    if (!archived) {
      return res.status(404).json({ error: 'Archived report not found' });
    }

    // Restore the report
    await Report.create(archived.toObject());

    // Remove it from archive
    await ArchivedReport.findByIdAndDelete(id);

    // 2. Create the activity log here
    const newLog = new ActivityLog({
      user: req.user._id, // admin ID
      onModel: req.userType,
      action: 'Report Restored',
      details: `Report with ID ${archived._id} was restored from the archive.`,
    });
    
    // 3. Save the new log document
    await newLog.save();

    res.status(200).json({ message: 'Report restored successfully' });
  } catch (error) {
    console.error('Error restoring report:', error);
    res.status(500).json({ error: 'Failed to restore report' });
  }
};

module.exports = { retrieveReport };