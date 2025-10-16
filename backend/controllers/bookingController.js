const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { fn, col } = require('sequelize');

module.exports = {
  // ================= USER BOOKING CREATION =================
  createBooking: async (req, res) => {
    try {
      // Use token userId or fallback from body
      const userIdRaw = req.user?.id || req.body.userId;
      const driverIdRaw = req.body.driverId;

      // Parse IDs to integers
      const userId = parseInt(userIdRaw);
      const driverId = parseInt(driverIdRaw);

      if (!userId || !driverId) {
        return res.status(400).json({ message: 'Invalid user or driver ID' });
      }

      const { pickupLocation, dropLocation, tripStart, tripEnd, specialRequests, amount } = req.body;

      if (!pickupLocation || !dropLocation || !tripStart || !tripEnd) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
      }

      // Validate driver existence
      const driver = await Driver.findByPk(driverId);
      if (!driver) return res.status(404).json({ message: 'Driver not found' });
      if (driver.availability === 'Not Available') return res.status(400).json({ message: 'Driver is not available' });

      // Validate dates
      const parsedTripStart = new Date(tripStart);
      const parsedTripEnd = new Date(tripEnd);
      if (isNaN(parsedTripStart) || isNaN(parsedTripEnd)) {
        return res.status(400).json({ message: 'Invalid trip start or end time format.' });
      }

      // Create booking
      const booking = await Booking.create({
        userId,
        driverId,
        pickupLocation,
        dropLocation,
        tripStart: parsedTripStart,
        tripEnd: parsedTripEnd,
        specialRequests: specialRequests || '',
        amount: amount || 0,
        status: 'Pending',
      });

      // Mark driver unavailable
      await driver.update({ availability: 'Not Available' });

      // Fetch full booking with associations
      const fullBooking = await Booking.findByPk(booking.id, {
        include: [
          { model: User, attributes: ['id', 'username', 'email', 'phone', 'district'], required: false },
          { model: Driver, attributes: ['id', 'name', 'email', 'phone', 'vehicleType'], required: false },
        ],
      });

      res.status(201).json({ message: 'Booking created successfully', booking: fullBooking });
    } catch (error) {
      console.error('createBooking error:', error);
      res.status(500).json({ message: 'Server error occurred while creating booking', error: error.message });
    }
  },

  // ================= DRIVER BOOKINGS =================
  getDriverBookings: async (req, res) => {
    try {
      const driverId = req.user?.id;
      if (!driverId) return res.status(401).json({ message: 'Unauthorized' });

      const bookings = await Booking.findAll({
        where: { driverId },
        include: [{ model: User, attributes: ['id', 'username', 'email', 'phone', 'district'], required: false }],
        order: [['tripStart', 'DESC']],
      });

      res.json(bookings);
    } catch (error) {
      console.error('getDriverBookings error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= STATUS UPDATE =================
  updateBookingStatus: async (req, res) => {
    try {
      const { bookingId, action } = req.params;
      const booking = await Booking.findByPk(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      const statusMap = { accept: 'Confirmed', reject: 'Rejected', cancel: 'Cancelled', complete: 'Completed' };
      const newStatus = statusMap[action?.toLowerCase()];
      if (!newStatus) return res.status(400).json({ message: 'Invalid action' });

      booking.status = newStatus;
      await booking.save();

      if (['Cancelled', 'Completed'].includes(newStatus)) {
        await Driver.update({ availability: 'Available' }, { where: { id: booking.driverId } });
      }

      res.json({ message: `Booking ${newStatus}`, booking });
    } catch (error) {
      console.error('updateBookingStatus error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= DRIVER DASHBOARD STATS =================
  getDriverStats: async (req, res) => {
    try {
      // accept both param and token
      const driverId = parseInt(req.params.driverId) || req.user?.id;
      if (!driverId) return res.status(400).json({ message: 'Driver ID missing' });

      const totalBookings = await Booking.count({ where: { driverId } });
      const pending = await Booking.count({ where: { driverId, status: 'Pending' } });
      const completed = await Booking.count({ where: { driverId, status: 'Completed' } });

      const earningsResult = await Booking.findOne({
        where: { driverId, status: 'Completed' },
        attributes: [[fn('SUM', col('amount')), 'totalEarnings']],
        raw: true,
      });

      const totalEarnings = parseFloat(earningsResult?.totalEarnings || 0);
      const driver = await Driver.findByPk(driverId);
      const averageRating = driver?.rating || 0;

      res.json({ totalBookings, pending, completed, totalEarnings, averageRating });
    } catch (error) {
      console.error('getDriverStats error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= DRIVER RECENT BOOKINGS =================
  getRecentDriverBookings: async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId) || req.user?.id;
      if (!driverId) return res.status(400).json({ message: 'Driver ID missing' });

      const recentBookings = await Booking.findAll({
        where: { driverId },
        include: [
          { model: User, attributes: ['id', 'username', 'email', 'phone', 'district'], required: false },
          { model: Driver, attributes: ['id', 'name', 'vehicleType'], required: false },
        ],
        order: [['tripStart', 'DESC']],
        limit: 5,
      });

      res.json(recentBookings);
    } catch (error) {
      console.error('getRecentDriverBookings error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= ADMIN GET ALL BOOKINGS =================
  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        include: [
          { model: User, attributes: ['id', 'username', 'email', 'phone', 'district'], required: false },
          { model: Driver, attributes: ['id', 'name', 'email', 'phone', 'vehicleType'], required: false },
        ],
        order: [['tripStart', 'DESC']],
      });

      res.json(bookings);
    } catch (error) {
      console.error('getAllBookings error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= GET BOOKING BY ID =================
  getBookingById: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: User, attributes: ['id', 'username', 'email', 'phone', 'district'], required: false },
          { model: Driver, attributes: ['id', 'name', 'email', 'phone', 'vehicleType'], required: false },
        ],
      });

      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      res.json(booking);
    } catch (error) {
      console.error('getBookingById error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};
