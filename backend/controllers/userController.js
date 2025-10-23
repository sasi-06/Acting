const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================================
// ✅ USER REGISTRATION
// ==========================================================
exports.registerUser = async (req, res) => {
  try {
    const { username, email, phone, password, district } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username, email, phone, district, password: hashedPassword
    });

    const token = jwt.sign(
      { id: newUser.id, role: 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        district: newUser.district
      }
    });
  } catch (error) {
    console.error('❌ registerUser error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// ==========================================================
// ✅ USER LOGIN
// ==========================================================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user.toJSON();
    res.status(200).json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error('❌ loginUser error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// ==========================================================
// ✅ GET USER PROFILE
// ==========================================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('❌ getProfile error:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// ==========================================================
// ✅ UPDATE USER PROFILE
// ==========================================================
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, district } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ username, phone, district });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('❌ updateProfile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// ==========================================================
// ✅ CREATE QUICK BOOKING (no duplicates)
// ==========================================================
exports.createQuickBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const pickupLocation =
      req.body.pickupLocation || req.body.pickup || req.body.from || req.body.source;
    const dropLocation =
      req.body.dropLocation || req.body.drop || req.body.destination || req.body.to;
    const tripStartDateTime =
      req.body.tripStartDateTime || req.body.startTime || req.body.date || req.body.tripStart;
    const tripEndDateTime =
      req.body.tripEndDateTime || req.body.endTime || req.body.tripEnd || null;
    const vehicleType =
      req.body.vehicleType || req.body.type || req.body.carType || 'Car';

    let driverId = req.body.driverId || (Array.isArray(req.body.driverIds) && req.body.driverIds[0]) || null;

    if (!pickupLocation || !dropLocation || !tripStartDateTime || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pickupLocation, dropLocation, tripStartDateTime, vehicleType',
      });
    }

    if (!driverId) {
      const availableDriver = await Driver.findOne({
        where: { availability: 'Available' },
        order: [['rating', 'DESC']],
      });
      if (!availableDriver) {
        return res.status(400).json({ success: false, message: 'No available driver found' });
      }
      driverId = availableDriver.id;
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const start = new Date(tripStartDateTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid tripStartDateTime format' });
    }

    const end = tripEndDateTime
      ? new Date(tripEndDateTime)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const existingBooking = await Booking.findOne({
      where: {
        userId,
        pickupLocation,
        dropLocation,
        tripStart: start,
        status: { [Op.ne]: 'Cancelled' },
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate booking detected. You have already booked this trip.',
      });
    }

    const booking = await Booking.create({
      userId,
      driverId: driver.id,
      pickupLocation,
      dropLocation,
      tripStart: start,
      tripEnd: end,
      vehicleType,
      status: 'Pending',
      fare: driver.salaryPerDay || 0,
      paymentStatus: 'Unpaid',
    });

    const response = {
      bookingId: booking.id,
      driverId: driver.id,
      driverName: driver.name,
      vehicleType: driver.vehicleType || vehicleType,
      pickupLocation: booking.pickupLocation,
      dropLocation: booking.dropLocation,
      status: booking.status,
      tripStartDateTime: booking.tripStart,
      salaryPerDay: driver.salaryPerDay,
    };

    res.json({
      success: true,
      message: 'Booking created successfully',
      data: response,
    });
  } catch (error) {
    console.error('❌ createQuickBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================================
// ✅ USER DASHBOARD STATS
// ==========================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalBookings = await Booking.count({ where: { userId } });
    const completed = await Booking.count({ where: { userId, status: 'Completed' } });
    const pending = await Booking.count({ where: { userId, status: 'Pending' } });

    res.json({ totalBookings, completed, pending });
  } catch (error) {
    console.error('❌ getDashboardStats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats', error: error.message });
  }
};

// ==========================================================
// ✅ RECENT BOOKINGS (salary fix)
// ==========================================================
exports.getRecentBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [{
        model: Driver,
        attributes: [
          'id',
          'name',
          'vehicleType',
          'rating',
          'yearsOfExperience',
          'specialization',
          'district',
          'salaryPerDay'
        ]
      }],
      order: [['tripStart', 'DESC']],
      limit: 5,
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      pickupLocation: b.pickupLocation || 'Not specified',
      dropLocation: b.dropLocation || 'Unknown Drop',
      tripStartDateTime: b.tripStart,
      status: b.status,
      driver: b.Driver ? {
        id: b.Driver.id,
        name: b.Driver.name,
        district: b.Driver.district,
        rating: b.Driver.rating,
        experience: b.Driver.yearsOfExperience,
        vehicleType: b.Driver.vehicleType,
        specialization: b.Driver.specialization,
        salaryPerDay: b.Driver.salaryPerDay ?? 'Not specified'
      } : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ getRecentBookings error:', error);
    res.status(500).json({
      message: 'Server error fetching recent bookings',
      error: error.message
    });
  }
};

// ==========================================================
// ✅ RECOMMENDED DRIVERS (salary fix)
// ==========================================================
exports.getRecommendedDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: { availability: 'Available' },
      attributes: [
        'id',
        'name',
        'vehicleType',
        'rating',
        'yearsOfExperience',
        'specialization',
        'district',
        'salaryPerDay' // ✅ Added here
      ],
      order: [['rating', 'DESC']],
      limit: 5
    });

    res.json(drivers);
  } catch (error) {
    console.error('❌ getRecommendedDrivers error:', error);
    res.status(500).json({ message: 'Server error fetching recommended drivers', error: error.message });
  }
};

// ==========================================================
// 🔥 SEARCH DRIVERS
// ==========================================================
exports.searchDrivers = async (req, res) => {
  try {
    const { district, vehicleType } = req.query;
    const where = { availability: 'Available' };
    if (district) where.district = district;
    if (vehicleType) where.vehicleType = vehicleType;

    const drivers = await Driver.findAll({
      where,
      attributes: ['id', 'name', 'district', 'vehicleType', 'rating', 'salaryPerDay']
    });

    res.json(drivers);
  } catch (err) {
    console.error('❌ searchDrivers error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
