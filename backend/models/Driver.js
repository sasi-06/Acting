const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  // Basic info
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [10, 10] }, // Ensure 10 digits for Indian numbers
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Professional info
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salaryPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 500 },
  },

  // Extra details
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Available', // Available / Not Available
  },
  healthStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Good',
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  licenseCopy: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Vehicle details
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carCompany: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numberOfPersons: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // Stats
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    validate: { min: 0, max: 5 },
  },
  totalTrips: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'pending', // pending / approved / rejected
  },
}, {
  tableName: 'drivers',
  timestamps: true, // createdAt and updatedAt automatically handled
});

module.exports = Driver;
