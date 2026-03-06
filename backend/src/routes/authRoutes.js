// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes (no auth required)
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require JWT)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;