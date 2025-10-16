const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// ✅ Define the User model
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
    validate: {
      isEmail: true,
    },
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

  // ✅ Added userType field to identify role
  userType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user",
  },

  // ✅ Sequelize handles timestamps automatically — no need to redefine them manually
}, {
  tableName: 'users',  // 👈 IMPORTANT: match your actual MySQL table name here
  timestamps: true,
  underscored: false,   // keeps camelCase columns
});


// ✅ Associations (do not change)
const Token = require('./Token');
User.hasMany(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;
