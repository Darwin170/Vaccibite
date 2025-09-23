const Log = require('../model/Activitylogs');

const addLog = async (req, res) => {
  const { user, onModel, action, details } = req.body; // <-- Add onModel here

  if (!user || !onModel || !action || !details) { // <-- Add validation for onModel
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newLog = await Log.create({ user, onModel, action, details }); // <-- Pass onModel to create
    console.log('New log added:', newLog);
    res.status(201).json({ message: 'Log added successfully', log: newLog });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ message: 'Error adding log', error: error.message });
  }
};

module.exports = { addLog };