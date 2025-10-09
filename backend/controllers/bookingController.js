const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { Op, fn, col } = require('sequelize');

module.exports = {
  // ================= USER BOOKING CREATION =================
  createBooking: async (req, res) => {
    try {
      const userId = req.user?.id; // from auth middleware
      const {
        driverId,
        pickupLocation,
        dropLocation,
        tripStart,
        tripEnd,
        specialRequests,
        amount
      } = req.body;

      if (!userId || !driverId || !pickupLocation || !dropLocation || !tripStart || !tripEnd) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
      }

      // Check driver availability
      const driver = await Driver.findByPk(driverId);
      if (!driver) return res.status(404).json({ message: 'Driver not found' });
      if (driver.availability === 'Not Available') {
        return res.status(400).json({ message: 'Driver is not available right now' });
      }

      // Create booking
      const booking = await Booking.create({
        userId,
        driverId,
        pickupLocation,
        dropLocation,
        tripStart,
        tripEnd,
        specialRequests,
        amount,
        status: 'Pending',
      });

      // Update driver status
      await driver.update({ availability: 'Not Available' });

      // Fetch full booking with relations
      const fullBooking = await Booking.findByPk(booking.id, {
        include: [
          { model: User },
          { model: Driver },
        ],
      });

      res.status(201).json({
        message: '✅ Booking created successfully',
        booking: fullBooking,
      });
    } catch (error) {
      console.error('❌ createBooking error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= USER BOOKINGS =================
  getUserBookings: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const bookings = await Booking.findAll({
        where: { userId },
        include: [{ model: Driver }],
        order: [['tripStart', 'DESC']],
      });

      res.json(bookings);
    } catch (error) {
      console.error('❌ getUserBookings error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= CANCEL BOOKING =================
  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user?.id;

      const booking = await Booking.findOne({ where: { id: bookingId, userId } });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      if (booking.status === 'Cancelled' || booking.status === 'Completed') {
        return res.status(400).json({ message: 'Booking cannot be cancelled' });
      }

      booking.status = 'Cancelled';
      await booking.save();

      // Make driver available again
      await Driver.update(
        { availability: 'Available' },
        { where: { id: booking.driverId } }
      );

      res.json({ message: '🚫 Booking cancelled successfully', booking });
    } catch (error) {
      console.error('❌ cancelBooking error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= ADMIN =================
  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        include: [{ model: User }, { model: Driver }],
        order: [['tripStart', 'DESC']],
      });
      res.json(bookings);
    } catch (error) {
      console.error('❌ getAllBookings error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= DRIVER BOOKINGS =================
  getDriverBookings: async (req, res) => {
    try {
      const driverId = req.user?.id;
      if (!driverId) return res.status(401).json({ message: 'Unauthorized' });

      const bookings = await Booking.findAll({
        where: { driverId },
        include: [{ model: User }],
        order: [['tripStart', 'DESC']],
      });

      res.json(bookings);
    } catch (error) {
      console.error('❌ getDriverBookings error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= STATUS UPDATE =================
  updateBookingStatus: async (req, res) => {
    try {
      const { bookingId, action } = req.params;
      const booking = await Booking.findByPk(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      const statusMap = {
        accept: 'Confirmed',
        reject: 'Rejected',
        cancel: 'Cancelled',
        complete: 'Completed',
      };

      const newStatus = statusMap[action?.toLowerCase()];
      if (!newStatus) return res.status(400).json({ message: 'Invalid action' });

      booking.status = newStatus;
      await booking.save();

      if (['Cancelled', 'Completed'].includes(newStatus)) {
        await Driver.update({ availability: 'Available' }, { where: { id: booking.driverId } });
      }

      res.json({ message: `Booking ${newStatus}`, booking });
    } catch (error) {
      console.error('❌ updateBookingStatus error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= SINGLE BOOKING =================
  getBookingById: async (req, res) => {
    try {
      const booking = await Booking.findByPk(req.params.bookingId, {
        include: [{ model: User }, { model: Driver }],
      });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      res.json(booking);
    } catch (error) {
      console.error('❌ getBookingById error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ================= DRIVER DASHBOARD STATS =================
  getDriverStats: async (req, res) => {
    try {
      const driverId = req.user?.id;
      if (!driverId) return res.status(401).json({ message: 'Unauthorized' });

      const totalTrips = await Booking.count({ where: { driverId, status: 'Completed' } });

      const earningsResult = await Booking.findOne({
        where: { driverId, status: 'Completed' },
        attributes: [[fn('SUM', col('amount')), 'totalEarnings']],
        raw: true,
      });

      const totalEarnings = parseFloat(earningsResult?.totalEarnings || 0);
      const driver = await Driver.findByPk(driverId);
      const rating = driver?.rating || 0;

      res.json({ totalTrips, totalEarnings, rating });
    } catch (error) {
      console.error('❌ getDriverStats error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};
