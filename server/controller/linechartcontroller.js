const Report = require('../model/reportsmodel');

const getLineChartData = async (req, res) => {
    const { startMonth, endMonth } = req.query;  // Accept startMonth and endMonth from query
  
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
  
      const data = await Report.aggregate([
        { $match: query },  // Apply the query filter
        {
          $group: {
            _id: { $month: "$date" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);
  
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const formatted = data.map(item => ({
        month: monthNames[item._id - 1],
        count: item.count
      }));
      
  
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch line chart data' });
    }
  };
  
  module.exports = { getLineChartData };