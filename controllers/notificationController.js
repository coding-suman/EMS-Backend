// controllers/notificationController.js
const Notification = require('../models/Notification');

// Create a new notification
const createNotification = async (req, res) => {
  const { userId, message, type } = req.body;

  try {
    const notification = await Notification.create({ userId, message, type });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
};

// Fetch notifications for a user
const getNotificationsForUser = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, read: false }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead
};
