const Report = require('../model/reportsmodel');

const getPieChartData = async (req, res) => {
    const { startMonth, endMonth, status } = req.query;  // Accept status, startMonth, and endMonth from query
  
    try {
      let query = {};
      if (startMonth && endMonth) {
        query.date = {
          $gte: new Date(new Date().getFullYear(), startMonth - 1, 1),  // Start month
          $lte: new Date(new Date().getFullYear(), endMonth, 0)          // End month
        };
      } else if (startMonth) {
        query.date = {
          $gte: new Date(new Date().getFullYear(), startMonth - 1, 1),  // Filter for one month
          $lte: new Date(new Date().getFullYear(), startMonth, 0)
        };
      }
  
      if (status) {
        query.status = status;  // Filter by report status (Pending, Ongoing, Resolved)
      }
  
      const data = await Report.aggregate([
        { $match: query },  // Apply the query filter
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        }
      ]);
  
      const formatted = data.map(item => ({
        name: item._id,
        value: item.count
      }));
  
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
  };
  
  module.exports = { getPieChartData };