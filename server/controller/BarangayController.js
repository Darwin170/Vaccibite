const Barangay = require('../model/barangaymodel');

const Barangays = async (req, res) => {
  try {
    const barangays = await Barangay.find();
    res.json(barangays);
  } catch (error) {
    console.error('Error fetching barangays:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {Barangays}