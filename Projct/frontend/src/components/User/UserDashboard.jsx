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
    vehicleType: ''
  });

  // ✅ fetch user profile + dashboard info
  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setProfile(response.data);
      } catch (err) {
        showNotification(err.message, "error");
      }
    };

    fetchProfile();
    fetchDashboardData();
    fetchRecentBookings();
    fetchRecommendedDrivers();
  }, [user]);

  // ✅ Fetch dashboard stats (using bookings data)
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getBookings(); // 🔑 use existing backend route
      const bookings = response.data || [];

      const completed = bookings.filter(b => b.status === 'Completed');
      const active = bookings.filter(b => b.status === 'Confirmed');

      setStats({
        totalBookings: bookings.length,
        activeBookings: active.length,
        completedBookings: completed.length,
        totalSpent: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        favoriteDrivers: 0 // can enhance later
      });
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch recent bookings (just show last 5 bookings)
  const fetchRecentBookings = async () => {
    try {
      const response = await userAPI.getBookings(); // 🔑 reusing same
      const bookings = response.data || [];
      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  // ✅ Fetch recommended drivers (placeholder for now)
  const fetchRecommendedDrivers = async () => {
    try {
      // If backend route exists, call it. Otherwise, just mock empty array.
      const response = await userAPI.searchDrivers({}); 
      setRecommendedDrivers(response.data || []);
    } catch (err) {
      // not critical, so just show empty
      setRecommendedDrivers([]);
    }
  };

  const handleQuickBooking = () => {
    if (!quickBookingData.pickupLocation || !quickBookingData.dropLocation) {
      showNotification('Please fill pickup and drop locations', 'warning');
      return;
    }
    showNotification('Redirecting to driver search...', 'info');
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

        {/* ✅ Recent Bookings */}
        <div className="recent-bookings">
          <h3>🕒 Recent Bookings</h3>
          {recentBookings.length === 0 ? (
            <p>No recent bookings found.</p>
          ) : (
            <ul>
              {recentBookings.map((booking, index) => (
                <li key={index}>
                  <strong>{booking.pickupLocation} → {booking.dropLocation}</strong>  
                  <span> ({new Date(booking.tripStartDateTime).toLocaleDateString()})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✅ Recommended Drivers */}
        <div className="recommended-drivers">
          <h3>⭐ Recommended Drivers</h3>
          {recommendedDrivers.length === 0 ? (
            <p>No recommendations right now.</p>
          ) : (
            <ul>
              {recommendedDrivers.map((driver, index) => (
                <li key={index}>
                  <strong>{driver.name}</strong> - {driver.vehicleType} 🚗  
                  <span> (Rating: {driver.rating}/5)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
