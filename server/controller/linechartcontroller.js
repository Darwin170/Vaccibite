const Report = require('../model/reportsmodel');

const getLineChartData = async (req, res) => {
  // Capture all possible filters from the request
  const { startMonth, endMonth, status, barangayId, incidentType } = req.query;

  try {
    let matchQuery = {};

    // Add filters to the match query if they are provided
    if (status) {
      matchQuery.status = status;
    }
    if (barangayId) {
      matchQuery.barangay = barangayId;
    }
    if (incidentType) {
        matchQuery.type = incidentType;
    }
    
    // Add a filter for the month range if both start and end months are provided
    // This uses the $expr operator to get the month number from the date
    // and correctly filter all years without needing to know the current year.
    if (startMonth && endMonth) {
      matchQuery.$expr = {
        $and: [
          { $gte: [{ $month: "$date" }, parseInt(startMonth)] },
          { $lte: [{ $month: "$date" }, parseInt(endMonth)] }
        ]
      };
    }

    const data = await Report.aggregate([
      // Apply all filters first using the matchQuery object
      { $match: matchQuery },
      {
        // Group the reports by both year and month to get a complete count over time
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        // Sort the data chronologically, first by year then by month
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Format the data to be easily consumed by the Recharts line graph
    const formattedData = data.map(item => ({
      // The 'month' label now includes the year, so different years are distinct points
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
