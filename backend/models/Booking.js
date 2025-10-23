const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Driver = require('./Driver');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Foreign keys
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: true, // driver can be assigned later
    references: {
      model: Driver,
      key: 'id',
    },
  },

  // Journey details
  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dropLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tripStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tripEnd: {
    type: DataTypes.DATE,
    allowNull: true, // ✅ made optional for initial booking
  },

  // Booking details
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending', // Pending, Confirmed, Completed, Cancelled
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // ✅ Added missing fields (used in frontend & controller)
  fare: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Unpaid', // Unpaid, Paid, Refunded
  },

}, {
  tableName: 'bookings',
  timestamps: true, // Sequelize will auto-add createdAt & updatedAt
});

// 🔗 Associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Driver.hasMany(Booking, { foreignKey: 'driverId' });
Booking.belongsTo(Driver, { foreignKey: 'driverId' });

module.exports = Booking;
