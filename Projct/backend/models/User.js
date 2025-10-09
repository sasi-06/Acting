const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {        
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dropLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tripStartDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tripEndDateTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  carCompany: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numberOfPersons: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  carNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // ✅ Added role field
  userType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user", // default role
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

// Associations
const Token = require('./Token');
User.hasMany(Token, { foreignKey: 'userId' });
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;
