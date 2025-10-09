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
  tripStart: {   // ✅ renamed to match frontend
    type: DataTypes.DATE,
    allowNull: false,
  },
  tripEnd: {     // ✅ renamed to match frontend
    type: DataTypes.DATE,
    allowNull: false,
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
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
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
