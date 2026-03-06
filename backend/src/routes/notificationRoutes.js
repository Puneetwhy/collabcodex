// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// All notification routes require authentication
router.use(protect);

router.get('/', getNotifications);               // ?page=1&limit=20&unreadOnly=true
router.get('/unread-count', getUnreadCount);     // fast badge update
router.patch('/:id/read', markAsRead);           // mark single
router.patch('/read-all', markAllAsRead);        // mark all

module.exports = router;