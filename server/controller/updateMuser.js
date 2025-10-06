const M_User = require('../model/M_user');
const bcrypt = require('bcryptjs');

const ActivityLog = require('../model/Activitylogs');

const updateMUser = async (req, res) => {
    try {
        const { id } = req.params;
        // FIX 1: Destructure all fields that can be updated, including barangay
        const { fullName, email, password, barangay } = req.body; 

        // FIX 2: Start with an empty object and only add fields that were provided/changed
        const updatedData = {}; 

        if (fullName) {
            updatedData.fullName = fullName;
        }
        if (email) {
            updatedData.email = email;
        }
        // FIX 3: Include barangay update
        if (barangay) {
            updatedData.barangay = barangay;
        }

        // Handle password hashing if a new password was provided
        if (password) {
            // FIX 4: Ensure the password field is hashed only if provided
            // Note: bcrypt.genSalt(10) returns a promise, so use await here
            updatedData.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
        }

        // FIX 5: Check if any fields are actually being updated
        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: "No fields provided for update." });
        }


        const updatedUser = await M_User.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Create and save the activity log
        const newLog = new ActivityLog({
            user: req.user._id, // admin ID
            onModel: req.userType, // <-- The model name
            action: 'User Profile Updated',
            details: `User ${updatedUser.email} profile was updated.`,
        });

        await newLog.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        // Provide more detailed error message if it's a validation error
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error during update.", details: error.message });
        }
        res.status(500).json({ message: "Failed to update user" });
    }
};

module.exports = { updateMUser };
