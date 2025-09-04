import Notification from "../models/Notification.js";


 const createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    const notification = new Notification({ userId, title, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {  
    createNotification
};
