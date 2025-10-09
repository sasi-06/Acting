const isUser = (req, res, next) => {
  if (req.user && req.user.userType === 'user') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: User role required' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

const isDriver = (req, res, next) => {
  if (req.user && req.user.userType === 'driver') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Driver role required' });
  }
};

module.exports = {
  isUser,
  isAdmin,
  isDriver,
};
