const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth'); // ✅ correct destructuring

// ====================== USER ROUTES ======================
// Public route — user can create booking without login
router.post('/', bookingController.createBooking);

// ====================== ADMIN ROUTES ======================
// Admin routes (require authentication)
router.get('/admin/all', auth, bookingController.getAllBookings);
router.put('/admin/:bookingId/:action', auth, bookingController.updateBookingStatus);

// ====================== DRIVER ROUTES ======================
// Driver routes (require authentication)
router.get('/driver', auth, bookingController.getDriverBookings);
router.put('/driver/:bookingId/:action', auth, bookingController.updateBookingStatus);
router.get('/driver/stats', auth, bookingController.getDriverStats);

// ====================== GENERAL ROUTES ======================
router.get('/:bookingId', bookingController.getBookingById);

module.exports = router;
