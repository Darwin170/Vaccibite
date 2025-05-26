const Report = require('../model/reportsmodel');
const ArchivedReport = require('../model/ArchivingReportsmodel');

const retrieveReport = async (req, res) => {
  const reportId = req.params.id;

  try {
    const archived = await ArchivedReport.findById(reportId);
    if (!archived) {
      return res.status(404).json({ error: 'Archived report not found' });
    }

    // Restore the report
    await Report.create(archived.toObject());

    // Remove it from archive
    await ArchivedReport.findByIdAndDelete(reportId);

    res.status(200).json({ message: 'Report restored successfully' });
  } catch (error) {
    console.error('Error restoring report:', error);
    res.status(500).json({ error: 'Failed to restore report' });
  }
};

module.exports = { retrieveReport };
