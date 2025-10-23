const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const { getAvailableDrivers } = require('../controllers/driverController');
const { authMiddleware } = require('../middleware/auth');
const Token = require('../models/Token');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const User = require('../models/User');

// -------------------- PUBLIC ROUTES --------------------

// ✅ User Registration
router.post('/register', userController.registerUser);

// ✅ User Login
router.post('/login', userController.loginUser);

// ✅ Public list of available drivers (no login needed)
router.get('/drivers', getAvailableDrivers);

// -------------------- AUTHENTICATED ROUTES --------------------

// ✅ Protect routes after this
router.use(authMiddleware);

// ✅ Logout
router.post('/logout', async (req, res) => {
  try {
    await Token.destroy({ where: { userId: req.user.id } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// ✅ User Profile Routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// -------------------- BOOKING ROUTES --------------------

// ✅ Create Booking
router.post('/bookings', bookingController.createBooking);

// ✅ Get All Bookings for the logged-in user
router.get('/bookings', async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        { model: Driver, attributes: ['id', 'name', 'district', 'rating'] },
        { model: User, attributes: ['id', 'username', 'email', 'district'] }
      ],
      order: [['tripStart', 'DESC']],
    });
    res.json(bookings);
  } catch (error) {
    console.error('❌ getUserBookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Cancel Booking
router.put('/bookings/:bookingId/cancel', bookingController.updateBookingStatus);

// 🔥 NEW: Quick Booking Route (creates bookings for drivers 1,3,4,7)
router.post('/quick-booking', userController.createQuickBooking);

// -------------------- DASHBOARD & INSIGHTS --------------------

// ✅ Dashboard Stats
router.get('/dashboard', userController.getDashboardStats);

// ✅ Recent Bookings
router.get('/recent-bookings', userController.getRecentBookings);

// ✅ Recommended Drivers
router.get('/recommended-drivers', userController.getRecommendedDrivers);

// ✅ 🔥 Search Drivers (for frontend filtering)
router.get('/drivers/search', userController.searchDrivers);

module.exports = router;
