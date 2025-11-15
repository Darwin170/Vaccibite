const MobileUser = require('../model/M_user');

const toggleMUserStatus = async (req, res) => {
    const { id } = req.params; 
    const { isActive } = req.body; 

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Invalid status provided." });
    }

    try {
        const updatedUser = await MobileUser.findByIdAndUpdate(
            id,
            { isActive: isActive },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Mobile user not found." });
        }

        res.status(200).json({
            message: `User ${updatedUser.fullName} status updated to ${isActive ? 'Active' : 'Inactive'}`,
            user: updatedUser
        });

    } catch (error) {
        console.error("Error toggling mobile user status:", error);
        res.status(500).json({ message: "Server error during status update." });
    }
};

module.exports = {
    toggleMUserStatus
};
