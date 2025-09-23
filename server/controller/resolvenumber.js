const Report = require('../model/reportsmodel');

const getResolvedReports = async (req, res) => {
    try {
        // Count reports where status is "Resolved"
        const count = await Report.countDocuments({ status: "Resolved" });
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getResolvedReports };
