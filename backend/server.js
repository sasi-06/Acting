  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const sequelize = require('./db');
  const Token = require('./models/Token');

  const app = express();
  const port = process.env.PORT || 5000;

  // ✅ Proper CORS setup
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000', 'https://actingdriver1.vercel.app'],
    credentials: true
  }));

  // ✅ Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ DB connection and sync
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Connected to MySQL successfully.');
      await sequelize.sync();
      console.log('✅ Database synchronized.');
    } catch (err) {
      console.error('❌ MySQL connection error:', err);
      process.exit(1);
    }
  })();

  // ✅ Routes
  const driverRoutes = require('./routes/driverRoutes');
  const userRoutes = require('./routes/userRoutes');
  const bookingRoutes = require('./routes/bookingRoutes');
  const adminRoutes = require('./routes/adminRoutes');

  app.use('/api/driver', driverRoutes);
  app.use('/api/user', userRoutes);

  // ✅ Support both singular & plural forms
  app.use('/api/booking', bookingRoutes);
  app.use('/api/bookings', bookingRoutes);

  app.use('/api/admin', adminRoutes);

  // ✅ Basic health check
  app.get('/', (req, res) => res.send('Acting Driver API running 🚀'));

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  module.exports = app;
