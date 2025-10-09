const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");
const Booking = require("../models/Booking");

module.exports = {
  // Register user
  registerUser: async (req, res) => {
    try {
      const {
        username,
        email,
        phone,
        password,
        district,
        pickupLocation,
        dropLocation,
        tripStartDateTime,
        tripEndDateTime,
        vehicleType,
        carCompany,
        numberOfPersons,
        carNumber,
      } = req.body;
      console.log(req.body);
      

      // Check if email exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with default userType
      const newUser = await User.create({
        username,
        email,
        phone,
        password: hashedPassword,
        district,
        userType: "user",
        pickupLocation,
        dropLocation,
        tripStartDateTime,
        tripEndDateTime,
        vehicleType,
        carCompany,
        numberOfPersons,
        carNumber,
      });
      // JWT with userType
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, userType: newUser.userType },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          district: newUser.district,
          userType: newUser.userType, // ✅ return userType
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set in environment variables.");
        return res.status(500).json({ message: "Server configuration error: missing JWT secret." });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

      // JWT with userType
      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          district: user.district,
          userType: user.userType, // ✅ always included
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { username, phone, district } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.username = username || user.username;
      user.phone = phone || user.phone;
      user.district = district || user.district;
      await user.save();

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Get user bookings
  getBookings: async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        include: ["Driver"], // ensure Booking model has association
        order: [["tripStartDateTime", "DESC"]],
      });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Create a booking
  createBooking: async (req, res) => {
    try {
      const { pickupLocation, dropLocation, tripStart, tripEnd, vehicleType, specialRequests } = req.body;
      const booking = await Booking.create({
        userId: req.user.id,
        pickupLocation,
        dropLocation,
        tripStart,
        tripEnd,
        status: "Pending",
        specialRequests,
      });
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Cancel a booking
  cancelBooking: async (req, res) => {
    try {
      const booking = await Booking.findOne({
        where: { id: req.params.bookingId, userId: req.user.id },
      });
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      if (booking.status !== "Pending" && booking.status !== "Confirmed") {
        return res.status(400).json({ message: "Cannot cancel this booking" });
      }

      booking.status = "Cancelled";
      await booking.save();
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const userId = req.user.id;

      const totalBookings = await Booking.count({ where: { userId } });
      const activeBookings = await Booking.count({
        where: { userId, status: { [Op.in]: ["Pending", "Confirmed"] } },
      });
      const completedBookings = await Booking.count({
        where: { userId, status: "Completed" },
      });

      const totalSpentResult = await Booking.findAll({
        where: { userId, status: "Completed" },
        attributes: [[Booking.sequelize.fn("SUM", Booking.sequelize.col("amount")), "totalSpent"]],
        raw: true,
      });
      const totalSpent = totalSpentResult[0].totalSpent || 0;

      const favoriteDriverResult = await Booking.findAll({
        where: { userId },
        attributes: ["driverId", [Booking.sequelize.fn("COUNT", Booking.sequelize.col("driverId")), "count"]],
        group: ["driverId"],
        order: [[Booking.sequelize.fn("COUNT", Booking.sequelize.col("driverId")), "DESC"]],
        limit: 1,
        raw: true,
      });

      const favoriteDriver = favoriteDriverResult.length > 0 ? favoriteDriverResult[0].driverId : null;

      res.json({
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent,
        favoriteDriver,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  getRecentBookings: async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        where: { userId: req.user.id },
        order: [["tripStartDateTime", "DESC"]],
        limit: 5, // recent 5 bookings
      });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  getRecommendedDrivers: async (req, res) => {
    try {
      // Example: return top 5 drivers with most completed bookings
      const drivers = await Booking.findAll({
        attributes: ["driverId", [Booking.sequelize.fn("COUNT", Booking.sequelize.col("driverId")), "count"]],
        where: { status: "Completed" },
        group: ["driverId"],
        order: [[Booking.sequelize.fn("COUNT", Booking.sequelize.col("driverId")), "DESC"]],
        limit: 5,
        raw: true,
      });
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

};
