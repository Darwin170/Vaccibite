const ActivityLog = require('../model/Activitylogs');

const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name position') 
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLogs };
