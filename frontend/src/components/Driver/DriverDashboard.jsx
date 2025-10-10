import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DriverDashboard.css';
const DriverDashboard = ({ user, showNotification }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0
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
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockStats = {
      totalBookings: 45,
      pendingBookings: 3,
      completedBookings: 40,
      totalEarnings: 67500,
      averageRating: 4.7
    };
    
    // Animate numbers
    Object.keys(mockStats).forEach(key => {
      let current = 0;
      const target = mockStats[key];
      const increment = target / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(current * 10) / 10 }));
      }, 50);
    });
    
    setLoading(false);
  };

  const fetchRecentBookings = async () => {
    const mockBookings = [
      {
        id: 1,
        customerName: 'Rajesh Kumar',
        pickupLocation: 'T. Nagar, Chennai',
        dropLocation: 'ECR Beach House',
        tripDate: '2025-09-05',
        status: 'Pending',
        amount: 2500,
        vehicleType: 'Sedan'
      },
      {
        id: 2,
        customerName: 'Ganesh M',
        pickupLocation: 'Coimbatore Railway Station',
        dropLocation: 'Ooty Hill Station',
        tripDate: '2025-09-03',
        status: 'Confirmed',
        amount: 3500,
        vehicleType: 'SUV'
      },
      {
        id: 3,
        customerName: 'Hari A',
        pickupLocation: 'Madurai Airport',
        dropLocation: 'Rameshwaram Temple',
        tripDate: '2025-09-01',
        status: 'Completed',
        amount: 4000,
        vehicleType: 'Luxury Car'
      }
    ];
    
    setRecentBookings(mockBookings);
  };

  const fetchNotifications = async () => {
    const mockNotifications = [
      {
        id: 1,
        message: 'New booking request from Rajesh Kumar',
        type: 'booking',
        time: '2 hours ago',
        read: false
      },
      {
        id: 2,
        message: 'Payment received for completed trip',
        type: 'payment',
        time: '1 day ago',
        read: true
      },
      {
        id: 3,
        message: 'New review: "Excellent driving skills!"',
        type: 'review',
        time: '2 days ago',
        read: false
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const handleAvailabilityChange = async (newAvailability) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvailability(newAvailability);
      showNotification(
        `Availability updated to ${newAvailability}`, 
        'success'
      );
    } catch (error) {
      showNotification('Failed to update availability', 'error');
    }
    
    setLoading(false);
  };

  const handleBookingAction = async (bookingId, action) => {
  setLoading(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update booking status
    setRecentBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: action === 'accept' ? 'Confirmed' : 'Rejected' }
          : booking
      )
    );
    
    // Automatically change driver status to "Not Available" when accepting
    if (action === 'accept') {
      setAvailability('Not Available');
    }
    
    showNotification(
      `Booking ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
      'success'
    );
  } catch (error) {
    showNotification('Action failed. Please try again.', 'error');
  }
  
  setLoading(false);
};

  const markNotificationRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Completed': 'status-completed',
      'Rejected': 'status-rejected'
    };
    
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome back Driver, {user.name}! 👋
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

        {/* Stats Cards */}
        <div className="stats-section">
          <div className="period-selector">
            <button
              className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              This Week
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              This Month
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              This Year
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card earnings">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">₹{stats.totalEarnings.toLocaleString()}</div>
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
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${star <= stats.averageRating ? 'filled' : ''}`}>
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
                <Link to="/driver/bookings" className="quick-action">View All →</Link>
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
            
            <div className="action-card" onClick={() => showNotification('Feature coming soon!', 'info')}>
              <div className="action-icon">💬</div>
              <div className="action-content">
                <h4>Customer Support</h4>
                <p>Get help & support</p>
              </div>
            </div>
            
            <div className="action-card" onClick={() => showNotification('Feature coming soon!', 'info')}>
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
            <Link to="/driver/bookings" className="btn btn-primary">View All</Link>
          </div>
          
          <div className="bookings-list">
            {recentBookings.map(booking => (
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
                      <span className="location-text">{booking.pickupLocation}</span>
                    </div>
                    <div className="location-arrow">→</div>
                    <div className="location-item">
                      <span className="location-icon">🎯</span>
                      <span className="location-text">{booking.dropLocation}</span>
                    </div>
                  </div>
                  
                  <div className="booking-meta">
                    <span className="vehicle-type">🚗 {booking.vehicleType}</span>
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

        {/* Notifications Panel */}
        <div className="notifications-section">
          <h3 className="section-title">Recent Notifications</h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => markNotificationRead(notification.id)}
              >
                <div className="notification-icon">
                  {notification.type === 'booking' && '📋'}
                  {notification.type === 'payment' && '💰'}
                  {notification.type === 'review' && '⭐'}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default DriverDashboard;