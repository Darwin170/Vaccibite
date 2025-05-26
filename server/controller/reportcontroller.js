const Report = require('../model/reportsmodel');

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate();
    res.json(reports);
    console.log(reports)

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {getAllReports};