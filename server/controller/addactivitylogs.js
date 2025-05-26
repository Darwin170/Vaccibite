const Log = require('../model/Activitylogs');

const addLog = async (req, res) => {
  const { user, action, details } = req.body;

  if (!user || !action || !details) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newLog = await Log.create({ user, action, details });
    console.log('New log added:', newLog);
    res.status(201).json({ message: 'Log added successfully', log: newLog });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ message: 'Error adding log', error: error.message });
  }
};

module.exports = { addLog };
