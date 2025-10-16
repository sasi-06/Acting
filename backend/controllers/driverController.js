const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');
const { Op } = require('sequelize');

// ----------------- DRIVER CONTROLLER -----------------

// ✅ Register driver
const registerDriver = async (req, res) => {
  try {
    const {
      driverName, licenseNumber, phone, email,
      yearsOfExperience, dob, district, city,
      availability, healthStatus, specialization, password, salaryPerDay
    } = req.body;

    // Check if email already exists
    const existingDriver = await Driver.findOne({ where: { email } });
    if (existingDriver) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Handle uploaded file
    let licenseCopyPath = null;
    if (req.files && req.files.licenseCopy && req.files.licenseCopy[0]) {
      licenseCopyPath = req.files.licenseCopy[0].path;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new driver
    const newDriver = await Driver.create({
      name: driverName,
      licenseNumber,
      phone,
      email,
      yearsOfExperience,
      dob,
      district,
      city,
      availability: availability || 'Available',
      healthStatus,
      specialization,
      password: hashedPassword,
      salaryPerDay,
      licenseCopy: licenseCopyPath
    });

    // Generate JWT token immediately after registration
    const token = jwt.sign(
      { id: newDriver.id, role: 'driver' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...driverData } = newDriver.toJSON();

    res.status(201).json({
      message: 'Driver registered successfully',
      token,
      driver: driverData
    });
  } catch (err) {
    console.error('Register driver error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// ✅ Login driver
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ where: { email } });
    if (!driver) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // ✅ Include `role: 'driver'` (must match middleware)
    const token = jwt.sign(
      { id: driver.id, role: 'driver' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...driverData } = driver.toJSON();

    res.status(200).json({
      message: 'Login successful',
      token,
      driver: driverData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ✅ Get driver profile (requires authMiddleware)
const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json(driver);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// ✅ Update driver profile (requires auth + driver role)
const updateDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.user.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const {
      name, phone, vehicleType, licenseNumber,
      yearsOfExperience, dob, district, city,
      availability, healthStatus, specialization, salaryPerDay
    } = req.body;

    // Handle file upload if new one exists
    const licenseCopy = req.file ? req.file.path : driver.licenseCopy;

    await driver.update({
      name, phone, vehicleType, licenseNumber,
      yearsOfExperience, dob, district, city,
      availability, healthStatus, specialization, salaryPerDay,
      licenseCopy
    });

    const { password: _, ...driverData } = driver.toJSON();
    res.status(200).json({
      message: 'Profile updated successfully',
      driver: driverData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// ✅ Get available drivers (for users)
const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: { availability: 'Available' },
      attributes: ['id', 'name', 'district', 'city', 'rating', 'salaryPerDay'],
      order: [['rating', 'DESC']]
    });

    const driverList = drivers.map(driver => ({
      id: driver.id,
      name: driver.name,
      location: driver.city || driver.district || 'Unknown',
      rating: driver.rating || 0,
      price: driver.salaryPerDay ? `${driver.salaryPerDay}/day` : 'N/A'
    }));

    res.status(200).json(driverList);
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).json({ message: 'Server error while fetching drivers' });
  }
};

module.exports = {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverProfile,
  getAvailableDrivers
};
