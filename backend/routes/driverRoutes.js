const express = require('express');
const router = express.Router();
const {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverProfile,
} = require('../controllers/driverController');
const { driverAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const db = require('../db');

// ====================== FILE UPLOAD CONFIG ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ====================== PUBLIC ROUTES ======================
router.post(
  '/register',
  upload.fields([{ name: 'licenseCopy', maxCount: 1 }]),
  registerDriver
);
router.post('/login', loginDriver);

// ====================== PROTECTED ROUTES (DRIVER) ======================
router.get('/profile', driverAuth, getDriverProfile);
router.put('/profile', driverAuth, upload.single('licenseCopy'), updateDriverProfile);

// ====================== DRIVER DASHBOARD ROUTES ======================

// 🔹 Get driver stats (for dashboard cards)
router.get('/stats/:driverId', driverAuth, async (req, res) => {
  const driverId = req.params.driverId;
  try {
    const [rows] = await db.query(
      `
      SELECT
        COUNT(*) AS totalBookings,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(fare) AS totalEarnings,
        AVG(rating) AS averageRating
      FROM bookings
      WHERE driver_id = ?
    `,
      [driverId]
    );

    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    res.status(500).json({ message: 'Error fetching driver stats' });
  }
});

// 🔹 Get recent bookings for driver (includes user details)
router.get('/recent/:driverId', driverAuth, async (req, res) => {
  const driverId = req.params.driverId;
  try {
    const [bookings] = await db.query(
      `
      SELECT 
        b.booking_id AS id,
        b.pickup,
        b.drop,
        b.status,
        b.fare,
        b.date,
        b.time,
        u.name AS userName,
        u.phone AS userPhone,
        u.district AS userDistrict
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.driver_id = ?
      ORDER BY b.date DESC, b.time DESC
      LIMIT 5
    `,
      [driverId]
    );

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching driver recent bookings:', error);
    res.status(500).json({ message: 'Error fetching recent bookings' });
  }
});

module.exports = router;
