const M_User = require('../models/Mobile_User');
const Barangay = require('../models/Barangay');

const getDistrictAndBarangay = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await M_User.findById(userId).populate('barangay');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const locationData = {
      fullName: user.fullName, // Now includes the user's full name
      district: user.barangay ? user.barangay.district : 'Not specified',
      barangay: user.barangay ? user.barangay.name : 'Not specified'
    };

    res.status(200).json({
      success: true,
      data: locationData
    });

  } catch (err) {
    console.error('Error fetching user location:', err);
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: err.message
    });
  }
};


module.exports = {
  getDistrictAndBarangay
};
