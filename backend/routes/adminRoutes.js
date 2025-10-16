const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware: auth } = require('../middleware/auth');
const { isAdmin } = require("../middleware/roles");

// All admin routes require authentication
router.use(auth);

// Dashboard stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);

// Driver management
router.get('/drivers', adminController.getDrivers);
router.put('/drivers/:driverId', adminController.updateDriver);

// Booking management
router.get('/bookings', adminController.getStats); // Reuse stats for now, can be expanded
router.put('/bookings/:bookingId', adminController.updateBooking);

module.exports = router;
