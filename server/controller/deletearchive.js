const Report = require('../model/ArchivingReportsmodel'); 

const deleteArchivedReport = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Report.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { deleteArchivedReport };
