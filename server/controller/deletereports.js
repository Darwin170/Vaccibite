const Report = require('../model/reportsmodel');
const ArchivedReport = require('../model/ArchivingReportsmodel'); // make sure this model exists

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Archiving and deleting report with id:', id);

    // Find the report first
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Archive the report
    await ArchivedReport.create(report.toObject());

    // Delete from the original collection
    await Report.findByIdAndDelete(id);

    res.status(200).json({ message: 'Report archived and deleted successfully.' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error archiving and deleting report.' });
  }
};

module.exports = { deleteReport };
