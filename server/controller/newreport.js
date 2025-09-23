const Report = require("../model/reportsmodel");

//  Controller: Get new reports count
const getNewReports = async (req, res) => {
  try {
    const since = new Date();
    since.setMinutes(since.getMinutes() - 10); // last 10 mins

    const newReportsCount = await Report.countDocuments({
      date: { $gte: since },
      status: "Pending" 
    });

    res.json({ count: newReportsCount });
  } catch (error) {
    console.error("Error fetching new reports:", error);
    res.status(500).json({ error: "Failed to fetch new reports" });
  }
};

module.exports = { getNewReports };
