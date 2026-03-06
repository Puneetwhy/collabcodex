// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');

// Get user's notifications (paginated, optional unread filter)
const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  try {
    const query = { user: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const notifications = await Notification.find(query)
      .populate('fromUser', 'username avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      unreadCount: await Notification.countDocuments({ user: req.user._id, read: false }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Get unread count only (fast endpoint for bell badge)
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or not yours' });
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ message: 'Error marking as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking all as read' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};