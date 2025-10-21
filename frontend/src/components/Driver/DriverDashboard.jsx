import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DriverDashboard.css';

const DriverDashboard = ({ user, showNotification }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  const [availability, setAvailability] = useState('Available');
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
    fetchRecentBookings();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  // ===================== Fetch Stats =====================
  const fetchDashboardData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/bookings/driver/stats/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats({
          totalBookings: data.totalBookings || 0,
          pendingBookings: data.pending || 0,
          completedBookings: data.completed || 0,
          totalEarnings: data.totalEarnings || 0,
          averageRating: data.averageRating || 0,
        });
      } else {
        showNotification?.(data.message || 'Failed to load stats', 'error');
      }
    } catch (error) {
      console.error('❌ fetchDashboardData error:', error);
      showNotification?.('Error fetching stats', 'error');
    }
    setLoading(false);
  };

  // ===================== Fetch Recent Bookings =====================
  // ===================== Fetch Recent Bookings =====================
const fetchRecentBookings = async () => {
  if (!user?.id) return;

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:5000/api/bookings/driver/recent/${user.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      const mapped = data.map((booking) => ({
        id: booking.id,
        customerName:
          booking.User?.username ||
          booking.User?.name ||
          'Unknown User',
        pickupLocation: booking.pickupLocation || 'N/A',
        dropLocation: booking.dropLocation || 'N/A',
        tripDate: booking.tripStart
          ? new Date(booking.tripStart).toLocaleString()
          : 'No Date',
        status: booking.status,
        amount: booking.amount || 0,
        vehicleType: booking.Driver?.vehicleType || 'N/A',
      }));

      setRecentBookings(mapped);
    } else {
      showNotification?.(data.message || 'No bookings found', 'info');
    }
  } catch (error) {
    console.error('❌ fetchRecentBookings error:', error);
    showNotification?.('Error fetching bookings', 'error');
  }
  setLoading(false);
};


  // ===================== Notifications (Mock) =====================
  const fetchNotifications = async () => {
    const mockNotifications = [
      {
        id: 1,
        message: 'New booking request received!',
        type: 'booking',
        time: '1 day  ago',
        read: false,
      },
      {
        id: 2,
        message: 'Payment received for completed trip',
        type: 'payment',
        time: '1 day ago',
        read: true,
      },
      {
        id: 3,
        message: 'New review from user: "Excellent driving!"',
        type: 'review',
        time: '2 days ago',
        read: false,
      },
    ];
    setNotifications(mockNotifications);
  };

  // ===================== Availability Toggle =====================
  const handleAvailabilityChange = async (newAvailability) => {
    if (!user?.id) {
      showNotification?.('Driver not logged in', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/drivers/${user.id}/availability`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability: newAvailability }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAvailability(newAvailability);
        showNotification?.(`Availability updated to ${newAvailability}`, 'success');
      } else {
        showNotification?.(data.message || 'Failed to update', 'error');
      }
    } catch (error) {
      console.error('❌ handleAvailabilityChange error:', error);
      showNotification?.('Failed to update availability', 'error');
    }
    setLoading(false);
  };

  // ===================== Booking Action =====================
  const handleBookingAction = async (bookingId, action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/bookings/driver/${bookingId}/${action}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (response.ok && data.booking) {
        setRecentBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: data.booking.status } : b))
        );

        if (action === 'accept') setAvailability('Not Available');
        showNotification?.(`Booking ${action}ed successfully`, 'success');
      } else {
        showNotification?.(data.message || 'Action failed', 'error');
      }
    } catch (error) {
      console.error('❌ handleBookingAction error:', error);
      showNotification?.('Action failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  // ===================== Notification Read =====================
  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // ===================== Status Badge =====================
  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: 'status-pending',
      Confirmed: 'status-confirmed',
      Completed: 'status-completed',
      Rejected: 'status-rejected',
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  // ===================== JSX =====================
  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome back Driver, {user?.name || 'Guest'}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's your driving activity overview
            </p>
          </div>

          <div className="availability-toggle">
            <label className="toggle-label">Current Status:</label>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${availability === 'Available' ? 'active' : ''}`}
                onClick={() => handleAvailabilityChange('Available')}
                disabled={loading}
              >
                🟢 Available
              </button>
              <button
                className={`toggle-btn ${availability === 'Not Available' ? 'active' : ''}`}
                onClick={() => handleAvailabilityChange('Not Available')}
                disabled={loading}
              >
                🔴 Busy
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="period-selector">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'week'
                  ? 'This Week'
                  : period === 'month'
                  ? 'This Month'
                  : 'This Year'}
              </button>
            ))}
          </div>

          <div className="stats-grid">
            <div className="stat-card earnings">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">
                  ₹{stats.totalEarnings.toLocaleString()}
                </div>
                <div className="stat-label">Total Earnings</div>
                <div className="stat-change">+12% from last period</div>
              </div>
            </div>

            <div className="stat-card bookings">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
                <div className="stat-change">+3 new this week</div>
              </div>
            </div>

            <div className="stat-card rating">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-number">{stats.averageRating}</div>
                <div className="stat-label">Average Rating</div>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= stats.averageRating ? 'filled' : ''}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">{stats.pendingBookings}</div>
                <div className="stat-label">Pending Requests</div>
                <Link to="/driver/bookings" className="quick-action">
                  View All →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <Link to="/driver/profile" className="action-card">
              <div className="action-icon">👤</div>
              <div className="action-content">
                <h4>Update Profile</h4>
                <p>Manage your information</p>
              </div>
            </Link>

            <Link to="/driver/bookings" className="action-card">
              <div className="action-icon">📅</div>
              <div className="action-content">
                <h4>View Bookings</h4>
                <p>Manage your trips</p>
              </div>
            </Link>

            <div
              className="action-card"
              onClick={() => showNotification?.('Feature coming soon!', 'info')}
            >
              <div className="action-icon">💬</div>
              <div className="action-content">
                <h4>Customer Support</h4>
                <p>Get help & support</p>
              </div>
            </div>

            <div
              className="action-card"
              onClick={() => showNotification?.('Feature coming soon!', 'info')}
            >
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h4>Earnings Report</h4>
                <p>View detailed analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bookings-section">
          <div className="section-header">
            <h3 className="section-title">Recent Bookings</h3>
            <Link to="/driver/bookings" className="btn btn-primary">
              View All
            </Link>
          </div>

          <div className="bookings-list">
            {recentBookings.length === 0 && (
              <p className="no-bookings">No recent bookings available</p>
            )}

            {recentBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {booking.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="customer-name">{booking.customerName}</h4>
                      <p className="booking-date">{booking.tripDate}</p>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="booking-details">
                  <div className="location-info">
                    <div className="location-item">
                      <span className="location-icon">📍</span>
                      <span className="location-text">
                        {booking.pickupLocation}
                      </span>
                    </div>
                    <div className="location-arrow">→</div>
                    <div className="location-item">
                      <span className="location-icon">🎯</span>
                      <span className="location-text">
                        {booking.dropLocation}
                      </span>
                    </div>
                  </div>

                  <div className="booking-meta">
                    <span className="vehicle-type">
                      🚗 {booking.vehicleType}
                    </span>
                    <span className="amount">💰 ₹{booking.amount}</span>
                  </div>
                </div>

                {booking.status === 'Pending' && (
                  <div className="booking-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleBookingAction(booking.id, 'accept')}
                      disabled={loading}
                    >
                      ✅ Accept
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleBookingAction(booking.id, 'reject')}
                      disabled={loading}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="notifications-section">
          <h3 className="section-title">Recent Notifications</h3>
          <div className="notifications-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="notification-icon">
                  {n.type === 'booking' && '📋'}
                  {n.type === 'payment' && '💰'}
                  {n.type === 'review' && '⭐'}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{n.message}</p>
                  <span className="notification-time">{n.time}</span>
                </div>
                {!n.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
