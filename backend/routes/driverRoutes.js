const express = require('express');
const router = express.Router();
const { registerDriver, loginDriver, getDriverProfile, updateDriverProfile } = require('../controllers/driverController');
const { driverAuth } = require('../middleware/auth'); // ✅ must be proper middleware
const multer = require('multer');
const path = require('path');

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Public routes
router.post('/register', upload.fields([{ name: 'licenseCopy', maxCount: 1 }]), registerDriver);
router.post('/login', loginDriver);

// Protected routes (driver only)
router.get('/profile', driverAuth, getDriverProfile);
router.put('/profile', driverAuth, upload.single('licenseCopy'), updateDriverProfile);

module.exports = router;
