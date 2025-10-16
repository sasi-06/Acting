const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware: auth } = require('../middleware/auth');

// ====================== USER ROUTES ======================
// User route — require authentication to create booking
router.post('/', auth, bookingController.createBooking);

// ====================== ADMIN ROUTES ======================
// Admin routes (require authentication)
router.get('/admin/all', auth, bookingController.getAllBookings);
router.put('/admin/:bookingId/:action', auth, bookingController.updateBookingStatus);

// ====================== DRIVER ROUTES ======================
// Driver routes (require authentication)
router.get('/driver', auth, bookingController.getDriverBookings);
router.put('/driver/:bookingId/:action', auth, bookingController.updateBookingStatus);

// ✅ Added missing routes for driver stats and recent bookings
router.get('/driver/stats/:driverId', auth, bookingController.getDriverStats);
router.get('/driver/recent/:driverId', auth, bookingController.getRecentDriverBookings);

// ====================== GENERAL ROUTES ======================
router.get('/:bookingId', bookingController.getBookingById);

module.exports = router;
