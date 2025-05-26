
const ArchivedReport = require('../model/ArchivingReportsmodel');

const getArchivedReports = async (req, res) => {
  try {
    const archivedReports = await ArchivedReport.find();

    if (!archivedReports || archivedReports.length === 0) {
      return res.status(404).json({ message: 'No archived reports found.' });
    }

    res.status(200).json(archivedReports);
  } catch (error) {
    console.error('Error fetching archived reports:', error);
    res.status(500).json({ message: 'Server error retrieving archived reports.' });
  }
};

module.exports = { getArchivedReports };
