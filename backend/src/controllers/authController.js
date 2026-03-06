// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // long-lived for dev convenience; shorten in prod
  });
};

const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Email, password, and username are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email ? 'Email already in use' : 'Username already taken',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    });

    const token = generateToken(user._id);

    // Optional: Set httpOnly cookie (more secure than localStorage)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token, // for localStorage fallback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    // Optional httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const logout = (req, res) => {
  // Clear httpOnly cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  // req.user is attached by authMiddleware.protect
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
  });
};

module.exports = { signup, login, logout, getMe };