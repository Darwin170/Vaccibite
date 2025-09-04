const Report = require('../model/reportsmodel');
const Barangay = require('../model/barangaymodel');
const mongoose = require('mongoose'); // ✅ Add this line to access ObjectId

const getLineChartData = async (req, res) => {
  const { startMonth, endMonth, status, barangayId, incidentType, district } = req.query;

  try {
    let matchQuery = {};

    if (status) {
      matchQuery.status = status;
    }

    // ✅ FIX: Convert the barangayId string to a MongoDB ObjectId
    if (barangayId) {
      matchQuery.barangayId = new mongoose.Types.ObjectId(barangayId);
    }

    if (incidentType) {
      matchQuery.type = incidentType;
    }

    if (district) {
      const barangaysInDistrict = await Barangay.find({ district }).select("_id");
      matchQuery.barangayId = { $in: barangaysInDistrict.map(b => b._id) };
    }

    if (startMonth && endMonth) {
      matchQuery.$expr = {
        $and: [
          { $gte: [{ $month: "$date" }, parseInt(startMonth)] },
          { $lte: [{ $month: "$date" }, parseInt(endMonth)] }
        ]
      };
    }

    const data = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedData = data.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching line chart data:", error);
    res.status(500).json({ error: 'Failed to fetch line chart data' });
  }
};

module.exports = { getLineChartData };