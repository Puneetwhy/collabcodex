// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized - user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized - token failed' });
    }
  } else if (req.cookies?.token) {
    // Optional: support httpOnly cookie JWT (more secure)
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized - invalid cookie token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized - no token' });
  }
};

// Optional: optional auth (for public projects later)
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization?.startsWith('Bearer') ||
    req.cookies?.token
  ) {
    return protect(req, res, next);
  }
  next(); // proceed without user
};

module.exports = { protect, optionalAuth };