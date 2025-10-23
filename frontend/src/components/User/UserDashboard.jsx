import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './UserDashboard.css';

const UserDashboard = ({ user, showNotification = (msg, type) => alert(msg) }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteDrivers: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [recommendedDrivers, setRecommendedDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState(null);

  const [quickBookingData, setQuickBookingData] = useState({
    pickupLocation: '',
    dropLocation: '',
    tripDate: '',
    dropDate: '',
    vehicleType: ''
  });

  // ✅ Fetch user profile + dashboard info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setProfile(response.data);
      } catch (err) {
        showNotification(err.message || 'Failed to fetch user profile', 'error');
      }
    };

    fetchProfile();
    fetchDashboardData();
    fetchRecentBookings();
    fetchRecommendedDrivers();
  }, [user]);

  // ✅ Fetch dashboard stats
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getBookings();
      const bookings = response.data || [];

      const completed = bookings.filter(b => b.status === 'Completed');
      const active = bookings.filter(b => b.status === 'Confirmed');

      setStats({
        totalBookings: bookings.length,
        activeBookings: active.length,
        completedBookings: completed.length,
        totalSpent: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        favoriteDrivers: 0
      });
    } catch (err) {
      showNotification(err.message || 'Error loading dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch recent bookings
  const fetchRecentBookings = async () => {
    try {
      const response = await userAPI.getBookings();
      const bookings = response.data || [];
      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      showNotification(err.message || 'Failed to load bookings', 'error');
    }
  };

  // ✅ Fetch recommended drivers
  const fetchRecommendedDrivers = async () => {
    try {
      const response = await userAPI.getRecommendedDrivers();
      setRecommendedDrivers(response.data || []);
    } catch (err) {
      setRecommendedDrivers([]);
    }
  };

  // ✅ Handle quick booking
  const handleQuickBooking = async () => {
    const { pickupLocation, dropLocation, tripDate, dropDate, vehicleType } = quickBookingData;

    if (!pickupLocation || !dropLocation || !tripDate || !dropDate || !vehicleType) {
      showNotification('Please fill all booking details including drop date.', 'warning');
      return;
    }

    try {
      const payload = {
        pickupLocation,
        dropLocation,
        tripStart: new Date(tripDate).toISOString(), // ✅ updated field name
        tripEnd: new Date(dropDate).toISOString(),   // ✅ updated field name
        vehicleType
      };

      const response = await userAPI.createQuickBooking(payload);
      showNotification(response.data?.message || 'Booking created successfully!', 'success');

      setQuickBookingData({
        pickupLocation: '',
        dropLocation: '',
        tripDate: '',
        dropDate: '',
        vehicleType: ''
      });

      fetchDashboardData();
      fetchRecentBookings();
    } catch (err) {
      showNotification(err.message || 'Failed to create booking', 'error');
    }
  };

  if (!profile) return <p>Loading user profile...</p>;

  return (
    <div className="user-dashboard">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-text">
            <h1>Welcome back, {profile.username}! 🙎‍♂️</h1>
            <p>Email: {profile.email}</p>
            <p>District: {profile.district}</p>
          </div>

          {weatherInfo && (
            <div className="weather-card">
              <div className="weather-icon">{weatherInfo.icon}</div>
              <div className="weather-details">
                <div className="temperature">{weatherInfo.temperature}</div>
                <div className="location">{weatherInfo.location}</div>
                <div className="condition">{weatherInfo.condition}</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Booking */}
        <div className="quick-booking">
          <h3>🚀 Quick Booking</h3>
          <div className="quick-booking-form">
            <input
              type="text"
              placeholder="📍 Pickup Location"
              value={quickBookingData.pickupLocation}
              onChange={(e) => setQuickBookingData(prev => ({ ...prev, pickupLocation: e.target.value }))}
            />
            <input
              type="text"
              placeholder="🎯 Drop Location"
              value={quickBookingData.dropLocation}
              onChange={(e) => setQuickBookingData(prev => ({ ...prev, dropLocation: e.target.value }))}
            />
            <input
              type="date"
              value={quickBookingData.tripDate}
              onChange={(e) => setQuickBookingData(prev => ({ ...prev, tripDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="date"
              value={quickBookingData.dropDate}
              onChange={(e) => setQuickBookingData(prev => ({ ...prev, dropDate: e.target.value }))}
              min={quickBookingData.tripDate || new Date().toISOString().split('T')[0]}
            />
            <select
              value={quickBookingData.vehicleType}
              onChange={(e) => setQuickBookingData(prev => ({ ...prev, vehicleType: e.target.value }))}
            >
              <option value="">🚗 Vehicle Type</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Luxury Car">Luxury Car</option>
            </select>
          </div>
          <button className="find-drivers-btn" onClick={handleQuickBooking}>🔍 Find Drivers</button>
        </div>

        {/* Stats */}
        <div className="stats-cards">
          <div className="stats-card bookings">
            <div className="icon">📋</div>
            <div className="details">
              <div className="count">{stats.totalBookings}</div>
              <div className="label">Total Bookings</div>
              <div className="sub-label">+2 this month</div>
            </div>
          </div>
          <div className="stats-card active">
            <div className="icon">🟢</div>
            <div className="details">
              <div className="count">{stats.activeBookings}</div>
              <div className="label">Active Trips</div>
              <div className="sub-label"><a href="/">View →</a></div>
            </div>
          </div>
          <div className="stats-card completed">
            <div className="icon">🏁</div>
            <div className="details">
              <div className="count">{stats.completedBookings}</div>
              <div className="label">Completed Trips</div>
              <div className="sub-label">96% success rate</div>
            </div>
          </div>
          <div className="stats-card spent">
            <div className="icon">💰</div>
            <div className="details">
              <div className="count">₹{stats.totalSpent.toLocaleString()}</div>
              <div className="label">Total Spent</div>
              <div className="sub-label">
                Avg ₹{Math.floor(stats.totalSpent / stats.totalBookings || 0)}/trip
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="recent-bookings">
          <h3>🕒 Recent Bookings</h3>
          {recentBookings.length === 0 ? (
            <p>No recent bookings found.</p>
          ) : (
            <ul>
              {recentBookings.map((booking, index) => {
                const startDate = booking.tripStart ? new Date(booking.tripStart) : null;
                const endDate = booking.tripEnd ? new Date(booking.tripEnd) : null;

                return (
                  <li key={index}>
                    <div>
                      <strong>{booking.pickupLocation || 'Not specified'} → {booking.dropLocation || 'Not specified'}</strong>
                      {booking.status && <span className="booking-status">{booking.status}</span>}
                    </div>
                    <span>
                      ({startDate && !isNaN(startDate) ? startDate.toLocaleDateString() : 'Invalid Date'}
                      {endDate && !isNaN(endDate) ? ` - ${endDate.toLocaleDateString()}` : ''})
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recommended Drivers */}
        <div className="recommended-drivers">
          <h3>⭐ Recommended Drivers</h3>
          {recommendedDrivers.length === 0 ? (
            <p>No recommendations right now.</p>
          ) : (
            <div className="drivers-grid">
              {recommendedDrivers.map((driver, index) => (
                <div className="driver-card" key={index}>
                  <div className="driver-header">
                    <h4>{driver.name}</h4>
                    <span className="rating">⭐ {driver.rating}/5</span>
                  </div>
                  <p><strong>Experience:</strong> {driver.yearsOfExperience} yrs</p>
                  <p><strong>Specialization:</strong> {driver.specialization}</p>
                  <p><strong>District:</strong> {driver.district}</p>
                  <p><strong>Salary per Day:</strong> ₹{driver.salaryPerDay ? driver.salaryPerDay : 'N/A'}</p>
                  <button className="book-btn">Book Now</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
