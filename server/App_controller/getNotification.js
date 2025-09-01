const getUserNotifications = async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ error: "receiverId is required" });
    }

    const notifications = await Notification.find({ receiverId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email'); // optional, to get sender info

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUserNotifications };


