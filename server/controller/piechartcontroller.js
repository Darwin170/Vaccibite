const Report = require('../model/reportsmodel');
const Barangay = require('../model/barangaymodel');
const mongoose = require('mongoose'); // ✅ Add this line to access ObjectId

const getPieChartData = async (req, res) => {
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
    } else if (startMonth) {
      matchQuery.$expr = {
        $eq: [{ $month: "$date" }, parseInt(startMonth)]
      };
    }

    const data = await Report.aggregate([
      { $match: matchQuery },
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
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ error: 'Failed to fetch pie chart data' });
  }
};

module.exports = { getPieChartData };