// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * 🔐 General Authentication Middleware
 * Verifies JWT and attaches user payload to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify JWT
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // decoded contains { id, role, ... }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

/**
 * 🚗 Driver Role Check
 * Allows only users with role: 'driver'
 */
const isDriver = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'driver') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied: drivers only' });
    }
  } catch (error) {
    console.error('Driver Role Check Error:', error);
    res.status(500).json({ message: 'Server error in driver authorization' });
  }
};

/**
 * 🔐 Combined Middleware for Driver Routes
 * Example usage: router.get('/profile', driverAuth, getDriverProfile);
 */
const driverAuth = [authMiddleware, isDriver];

module.exports = {
  authMiddleware,
  isDriver,
  driverAuth
};
