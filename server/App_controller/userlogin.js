const User = require('../model/M_user'); 

const loginUser = async (req, res) => {
  try {
    const { barangay, email, password } = req.body;

  
    if (!barangay || !email || !password) {
      return res.status(400).json({ message: 'Please provide barangay, email, and password.' });
    }

 
    const user = await User.findOne({ barangay, email });

=
    if (!user) {
      return res.status(401).json({ message: 'Invalid barangay or email.' });
    }

    if (password !== user.password) { 
      return res.status(401).json({ message: 'Invalid password.' });
    }


    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        barangay: user.barangay,
        email: user.email,
     
      },
   
    });

  } catch (error) {
    console.error('Login error:', error);
  
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
};

module.exports = { loginUser };
