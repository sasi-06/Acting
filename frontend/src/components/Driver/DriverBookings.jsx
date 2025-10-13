import React, { useState, useEffect } from 'react';
import { driverAPI } from '../../services/api';

const DriverBookings = ({ user, showNotification }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, filter, searchTerm, sortBy, sortOrder]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await driverAPI.getBookings();
      setBookings(response.data);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to fetch bookings', 'error');
    }
    setLoading(false);
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];
    
    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.status.toLowerCase() === filter.toLowerCase()
      );
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.dropLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.tripStartDateTime);
          bValue = new Date(b.tripStartDateTime);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'customer':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredBookings(filtered);
  };

  const handleBookingAction = async (bookingId, action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('driverToken');
      const response = await fetch(`http://localhost:5000/api/bookings/driver/${bookingId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Action failed. Please try again.');
      }
      const updatedBooking = await response.json();
      setBookings(prev =>
        prev.map(booking =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );
      showNotification(
        `Booking ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`,
        'success'
      );
      setShowModal(false);
    } catch (error) {
      showNotification(error.message || 'Action failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'status-pending', icon: '⏳' },
      'Confirmed': { class: 'status-confirmed', icon: '✅' },
      'Completed': { class: 'status-completed', icon: '🏁' },
      'Rejected': { class: 'status-rejected', icon: '❌' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {status}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="container">
      <div className="bookings-page">
        <div className="page-header">
          <h1 className="page-title">📋 My Bookings</h1>
          <p className="page-subtitle">Manage your trip requests and bookings</p>
        </div>

        {/* Filters and Search */}
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search by customer, pickup, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-buttons">
              {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(filterType => (
                <button
                  key={filterType}
                  className={`filter-btn ${filter === filterType ? 'active' : ''}`}
                  onClick={() => setFilter(filterType)}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType !== 'all' && (
                    <span className="filter-count">
                      {bookings.filter(b => b.status.toLowerCase() === filterType).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="customer">Sort by Customer</option>
              </select>
              
              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '🔼' : '🔽'}
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No bookings found</h3>
                <p>
                  {filter === 'all' 
                    ? "You don't have any bookings yet. They will appear here once customers book you."
                    : `No ${filter} bookings found.`
                  }
                </p>
              </div>
            ) : (
              filteredBookings.map((booking, index) => (
                <div
                  key={booking._id}
                  className="booking-card interactive"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => openBookingDetails(booking)}
                >
                  <div className="booking-header">
                    <div className="customer-section">
                      <div className="customer-avatar">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div className="customer-details">
                        <h3 className="customer-name">{booking.customerName}</h3>
                        <p className="booking-id">Booking #{booking._id}</p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="trip-timeline">
                    <div className="timeline-item pickup">
                      <div className="timeline-icon">📍</div>
                      <div className="timeline-content">
                        <div className="location">{booking.pickupLocation}</div>
                        <div className="datetime">
                          {formatDateTime(booking.tripStartDateTime).date} at{' '}
                          {formatDateTime(booking.tripStartDateTime).time}
                        </div>
                      </div>
                    </div>
                    
                    <div className="timeline-connector"></div>
                    
                    <div className="timeline-item drop">
                      <div className="timeline-icon">🎯</div>
                      <div className="timeline-content">
                        <div className="location">{booking.dropLocation}</div>
                        <div className="datetime">
                          {formatDateTime(booking.tripEndDateTime).date} at{' '}
                          {formatDateTime(booking.tripEndDateTime).time}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <span className="detail-icon">🚗</span>
                      <span>{booking.vehicleType} - {booking.carCompany}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <span>{booking.numberOfPersons} passengers</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🔢</span>
                      <span>{booking.carNumber}</span>
                    </div>
                    <div className="detail-item amount">
                      <span className="detail-icon">💰</span>
                      <span className="amount-value">₹{booking.amount}</span>
                    </div>
                  </div>

                  {booking.status === 'Pending' && (
                    <div className="booking-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-success action-btn"
                        onClick={() => handleBookingAction(booking._id, 'accept')}
                        disabled={loading}
                      >
                        ✅ Accept
                      </button>
                      <button
                        className="btn btn-danger action-btn"
                        onClick={() => handleBookingAction(booking._id, 'reject')}
                        disabled={loading}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  <div className="quick-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="quick-btn" title="Call Customer">
                      📞
                    </button>
                    <button className="quick-btn" title="Get Directions">
                      🗺️
                    </button>
                    <button className="quick-btn" title="More Details">
                      ℹ️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Booking Details Modal */}
        {showModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
              
              <div className="modal-header">
                <h2>📋 Booking Details</h2>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <div className="modal-content">
                <div className="customer-info-detailed">
                  <div className="customer-avatar large">
                    {selectedBooking.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3>{selectedBooking.customerName}</h3>
                    <p>📞 {selectedBooking.customerPhone}</p>
                    <p>🆔 Booking #{selectedBooking._id}</p>
                  </div>
                </div>

                <div className="trip-details-section">
                  <h4>🚗 Trip Information</h4>
                  <div className="details-grid">
                    <div className="detail-row">
                      <strong>Pickup:</strong>
                      <span>{selectedBooking.pickupLocation}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Drop:</strong>
                      <span>{selectedBooking.dropLocation}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Start Time:</strong>
                      <span>
                        {formatDateTime(selectedBooking.tripStartDateTime).date} at{' '}
                        {formatDateTime(selectedBooking.tripStartDateTime).time}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>End Time:</strong>
                      <span>
                        {formatDateTime(selectedBooking.tripEndDateTime).date} at{' '}
                        {formatDateTime(selectedBooking.tripEndDateTime).time}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Vehicle:</strong>
                      <span>{selectedBooking.vehicleType} - {selectedBooking.carCompany}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Car Number:</strong>
                      <span>{selectedBooking.carNumber}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Passengers:</strong>
                      <span>{selectedBooking.numberOfPersons} persons</span>
                    </div>
                    <div className="detail-row">
                      <strong>Amount:</strong>
                      <span className="amount-highlight">₹{selectedBooking.amount}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="special-requests">
                    <h4>📝 Special Requests</h4>
                    <p>{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {selectedBooking.status === 'Pending' && (
                  <div className="modal-actions">
                    <button
                      className="btn btn-success btn-full"
                      onClick={() => handleBookingAction(selectedBooking._id, 'accept')}
                      disabled={loading}
                    >
                      ✅ Accept Booking
                    </button>
                    <button
                      className="btn btn-danger btn-full"
                      onClick={() => handleBookingAction(selectedBooking._id, 'reject')}
                      disabled={loading}
                    >
                      ❌ Reject Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bookings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 3rem;
          background: linear-gradient(45deg, #e3e6f3ff, #f7f3fbff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }

        .page-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.2rem;
        }

        /* Controls Section */
        .controls-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .search-container {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 25px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }

        .filter-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 20px;
          border: 2px solid #667eea;
          background: transparent;
          color: #667eea;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .filter-count {
          margin-left: 8px;
          background: rgba(255, 255, 255, 0.3);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
        }

        .filter-btn.active .filter-count {
          background: rgba(255, 255, 255, 0.2);
        }

        .sort-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .sort-select {
          padding: 10px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .sort-select:focus {
          border-color: #667eea;
          outline: none;
        }

        .sort-order-btn {
          padding: 10px 12px;
          border: 2px solid #667eea;
          background: transparent;
          color: #667eea;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .sort-order-btn:hover {
          background: #667eea;
          color: white;
        }

        /* Bookings Grid */
        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
        }

        .booking-card.interactive {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideInUp 0.5s ease-out both;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .booking-card.interactive:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          transition: left 0.8s;
        }

        .booking-card.interactive:hover:before {
          left: 100%;
        }

        .booking-card.interactive:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(102, 126, 234, 0.3);
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .customer-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .customer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.3rem;
          transition: all 0.3s ease;
        }

        .booking-card:hover .customer-avatar {
          transform: scale(1.1) rotate(5deg);
        }

        .customer-name {
          margin-bottom: 5px;
          font-size: 1.3rem;
          color: #333;
          font-weight: 600;
        }

        .booking-id {
          color: #666;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
          animation: pulse 2s infinite;
        }

        .status-confirmed {
          background: #d4edda;
          color: #155724;
        }

        .status-completed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-rejected {
          background: #f8d7da;
          color: #721c24;
        }

        /* Trip Timeline */
        .trip-timeline {
          margin-bottom: 20px;
          position: relative;
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 15px;
        }

        .timeline-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          flex-shrink: 0;
          z-index: 2;
          position: relative;
        }

        .timeline-content {
          flex: 1;
        }

        .location {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
          font-size: 1.1rem;
        }

        .datetime {
          color: #666;
          font-size: 0.9rem;
        }

        .timeline-connector {
          width: 3px;
          height: 30px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          margin-left: 18px;
          margin-top: -10px;
          margin-bottom: -5px;
          border-radius: 2px;
          animation: grow 0.5s ease-out;
        }

        @keyframes grow {
          from { height: 0; }
          to { height: 30px; }
        }

        /* Booking Details */
        .booking-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .detail-item.amount {
          grid-column: 1 / -1;
          justify-content: center;
          background: linear-gradient(45deg, rgba(40, 167, 69, 0.1), rgba(32, 201, 151, 0.1));
          border: 2px solid rgba(40, 167, 69, 0.2);
        }

        .detail-icon {
          font-size: 1.1rem;
        }

        .amount-value {
          font-size: 1.3rem;
          font-weight: bold;
          color: #28a745;
        }

        /* Booking Actions */
        .booking-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 15px;
        }

        .action-btn {
          flex: 1;
          padding: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .quick-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(102, 126, 234, 0.1);
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-btn:hover {
          background: #667eea;
          transform: scale(1.2) rotate(5deg);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.8);
          grid-column: 1 / -1;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .empty-state h3 {
          font-size: 1.8rem;
          margin-bottom: 15px;
          color: white;
        }

        .empty-state p {
          font-size: 1.1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        /* Loading Section */
        .loading-section {
          text-align: center;
          padding: 60px;
          color: rgba(255, 255, 255, 0.8);
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top: 5px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal {
          background: white;
          border-radius: 20px;
          padding: 0;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          animation: slideUp 0.3s ease;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 25px;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .modal-close:hover {
          color: #dc3545;
          transform: rotate(90deg) scale(1.2);
        }

        .modal-header {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.8rem;
        }

        .modal-content {
          padding: 30px;
          overflow-y: auto;
          max-height: calc(80vh - 120px);
        }

        .customer-info-detailed {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 15px;
          border: 2px solid rgba(102, 126, 234, 0.1);
        }

        .customer-avatar.large {
          width: 70px;
          height: 70px;
          font-size: 2rem;
        }

        .trip-details-section {
          margin-bottom: 25px;
        }

        .trip-details-section h4 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.3rem;
          border-bottom: 2px solid #e1e5e9;
          padding-bottom: 10px;
        }

        .details-grid {
          display: grid;
          gap: 15px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row strong {
          color: #555;
          min-width: 120px;
        }

        .amount-highlight {
          font-size: 1.2rem;
          font-weight: bold;
          color: #28a745;
        }

        .special-requests {
          margin-bottom: 25px;
        }

        .special-requests h4 {
          color: #333;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }

        .special-requests p {
          background: rgba(255, 193, 7, 0.1);
          padding: 15px;
          border-radius: 10px;
          border-left: 4px solid #ffc107;
          color: #856404;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .bookings-page {
            padding: 15px;
          }

          .page-title {
            font-size: 2.2rem;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-buttons {
            justify-content: center;
          }

          .bookings-grid {
            grid-template-columns: 1fr;
          }

          .booking-details {
            grid-template-columns: 1fr;
          }

          .booking-actions {
            flex-direction: column;
          }

          .modal {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }

          .modal-content {
            padding: 20px;
          }

          .customer-info-detailed {
            flex-direction: column;
            text-align: center;
          }

          .details-grid {
            gap: 10px;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }

        @media (max-width: 480px) {
          .filter-buttons {
            flex-direction: column;
          }

          .filter-btn {
            text-align: center;
          }

          .customer-section {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .timeline-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .timeline-connector {
            margin: 0 auto;
            width: 3px;
          }

          .booking-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverBookings;