const MobileUser = require('../model/M_user');
const nodemailer = require('nodemailer'); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS, 
    },
});

const sendActivationEmail = async (email, fullName) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Account Activated Successfully!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Welcome, ${fullName}!</h2>
                <p>We are pleased to inform you that your mobile user account has been successfully **activated** by the administrator.</p>
                <p>You can now log in to the application and start using all the features.</p>
                <p style="margin-top: 25px;">Thank you for registering.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Activation email sent successfully to:', email);
    } catch (error) {
        console.error('Failed to send activation email:', error);
    }
};

const toggleMUserStatus = async (req, res) => {
    const { id } = req.params;
    const { isActivated } = req.body;  // <-- match schema

    if (typeof isActivated !== 'boolean') {
        return res.status(400).json({ message: "Invalid status provided." });
    }

    try {
        const currentUser = await MobileUser.findById(id);

        if (!currentUser) {
            return res.status(404).json({ message: "Mobile user not found." });
        }

        const shouldSendEmail = !currentUser.isActivated && isActivated;

        const updatedUser = await MobileUser.findByIdAndUpdate(
            id,
            { isActivated }, // <-- match schema
            { new: true, runValidators: true }
        );

        if (shouldSendEmail) {
            await sendActivationEmail(updatedUser.email, updatedUser.fullName);
        }

        res.status(200).json({
            message: `User ${updatedUser.fullName} status updated to ${isActivated ? 'Active' : 'Inactive'}`,
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
