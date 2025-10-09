// middleware/auth.js
const jwt = require('jsonwebtoken');

const driverAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Ensure this token is for a driver
    if (decoded.userType !== 'driver') {
      return res.status(403).json({ message: 'Unauthorized: driver access only' });
    }

    req.user = decoded; // decoded contains { id, email, userType }
    next();
  });
};

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded; // decoded contains { id, email, userType }
    next();
  });
};

const authMiddleware = (req, res, next) => {
  // ...your authentication logic...
  next();
};

const isDriver = (req, res, next) => {
  if (req.user && (req.user.role === 'driver' || req.user.userType === 'driver')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Not a driver' });
  }
};

module.exports = {
  driverAuth,
  auth,
  authMiddleware,
  isDriver
};
