const express = require('express');
const router = express.Router();
const { authMiddleware, isDriver } = require('../middleware/auth');
const multer = require('multer');
const path = require('path'); // ✅ ADD THIS LINE

const {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverProfile
} = require('../controllers/driverController');

// Configure file upload (for license copy)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// 🚗 Public routes
router.post('/register', upload.fields([{ name: 'licenseCopy', maxCount: 1 }]), registerDriver);
router.post('/login', loginDriver);

// 🛡️ Protected routes (Driver only)
router.use(authMiddleware, isDriver);

router.get('/profile', getDriverProfile);
router.put('/profile', upload.single('licenseCopy'), updateDriverProfile);

module.exports = router;
