const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { getAvailableDrivers } = require('../controllers/driverController');
const { auth } = require('../middleware/auth');
const Token = require('../models/Token');
const bookingController = require('../controllers/bookingController'); // ✅ Correct import

// -------------------- PUBLIC ROUTES --------------------

// User registration & login
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Public: fetch available drivers
router.get('/drivers', getAvailableDrivers);

// -------------------- AUTHENTICATED ROUTES --------------------

// Apply auth middleware to all routes below
router.use(auth);

// Logout
router.post("/logout", async (req, res) => {
  try {
    await Token.destroy({ where: { userId: req.user.id } });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// -------------------- BOOKING ROUTES --------------------

// Create a new booking
router.post('/bookings', bookingController.createBooking);

// Get all bookings of the logged-in user
router.get('/bookings', async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await require('../models/Booking').findAll({
      where: { userId },
      include: [
        { model: require('../models/Driver') },
        { model: require('../models/User') }
      ],
      order: [['tripStart', 'DESC']],
    });
    res.json(bookings);
  } catch (error) {
    console.error('getUserBookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel booking
router.put('/bookings/:bookingId/cancel', bookingController.updateBookingStatus); // ✅ Reuses existing logic

// -------------------- DASHBOARD & INSIGHTS --------------------
router.get('/dashboard', userController.getDashboardStats);
router.get('/recent-bookings', userController.getRecentBookings);
router.get('/recommended-drivers', userController.getRecommendedDrivers);

module.exports = router;
