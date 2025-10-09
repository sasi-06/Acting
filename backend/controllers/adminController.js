const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

module.exports = {
  // Get admin dashboard stats
  getStats: async (req, res) => {
    try {
      const totalDrivers = await Driver.count();
      const totalUsers = await User.count();
      const totalBookings = await Booking.count();
      const totalRevenueResult = await Booking.findAll({
        where: { status: 'Completed' },
        attributes: [[Booking.sequelize.fn('SUM', Booking.sequelize.col('amount')), 'totalRevenue']],
        raw: true,
      });
      const totalRevenue = totalRevenueResult[0].totalRevenue || 0;
      const pendingApprovals = await Driver.count({ where: { status: 'pending' } });
      const activeBookings = await Booking.count({ where: { status: { [Op.in]: ['Pending', 'Confirmed'] } } });

      res.json({
        totalDrivers,
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingApprovals,
        activeBookings,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all users
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [{
          model: Booking,
          attributes: ['id'],
        }],
        order: [['createdAt', 'DESC']],
      });

      // Add totalBookings count to each user
      const usersWithStats = users.map(user => ({
        ...user.toJSON(),
        totalBookings: user.Bookings.length,
      }));

      res.json(usersWithStats);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all drivers
  getDrivers: async (req, res) => {
    try {
      const drivers = await Driver.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
      });
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update driver status (approve/reject)
  updateDriver: async (req, res) => {
    try {
      const { status } = req.body;
      const driver = await Driver.findByPk(req.params.driverId);
      if (!driver) return res.status(404).json({ message: 'Driver not found' });

      driver.status = status;
      await driver.save();
      res.json({ message: 'Driver updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { name, phone, district } = req.body;
      const user = await User.findByPk(req.params.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.district = district || user.district;
      await user.save();
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update booking
  updateBooking: async (req, res) => {
    try {
      const { status, amount } = req.body;
      const booking = await Booking.findByPk(req.params.bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      booking.status = status || booking.status;
      booking.amount = amount || booking.amount;
      await booking.save();
      res.json({ message: 'Booking updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },
};
