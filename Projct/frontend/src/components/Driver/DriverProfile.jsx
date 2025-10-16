import React, { useState, useEffect } from 'react';
import './DriverProfile.css';
const DriverProfile = ({ user, setUser, showNotification }) => {
  const [profileData, setProfileData] = useState({
    driverName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    licenseNumber: 'TN01ABCD123456',
    yearsOfExperience: '5',
    district: 'Chennai',
    city: 'T. Nagar',
    availability: 'Available',
    healthStatus: 'Good',
    specialization: 'Long Distance Driving',
    salaryPerDay: '1500',
    profileImage: null
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileStats, setProfileStats] = useState({
    totalTrips: 45,
    averageRating: 4.7,
    totalEarnings: 67500,
    completionRate: 96
  });
  
  const [recentReviews, setRecentReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  const tamilNaduDistricts = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Vellore', 'Erode', 'Kanchipuram', 'Thoothukudi', 'Dindigul', 'Thanjavur'
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        driverName: user.name || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: user.phone || '9876543210',
        licenseNumber: user.licenseNumber || 'TN01ABCD123456',
        yearsOfExperience: user.yearsOfExperience || '5',
        district: user.district || 'Chennai',
        city: user.city || 'T. Nagar',
        availability: user.availability || 'Available',
        healthStatus: user.healthStatus || 'Good',
        specialization: user.specialization || 'Long Distance Driving',
        salaryPerDay: user.salaryPerDay || '1500',
        profileImage: null
      });
      setProfileStats({
        totalTrips: user.totalTrips || 0,
        averageRating: user.rating || 0,
        totalEarnings: (user.totalTrips || 0) * (user.salaryPerDay || 1500), // rough calculation
        completionRate: 96 // hardcoded for now
      });
    }
  }, [user]);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = () => {
    const mockReviews = [
      {
        id: 1,
        customerName: 'Rajesh Kumar',
        rating: 5,
        comment: 'Excellent driving skills and very professional behavior!',
        date: '2025-08-28',
        tripType: 'Chennai to Pondicherry'
      },
      {
        id: 2,
        customerName: 'Priya Sharma',
        rating: 4,
        comment: 'Good driver, reached on time. Smooth journey overall.',
        date: '2025-08-25',
        tripType: 'Airport Pickup'
      },
      {
        id: 3,
        customerName: 'Arjun Reddy',
        rating: 5,
        comment: 'Outstanding service! Will definitely book again.',
        date: '2025-08-20',
        tripType: 'Film Shoot Location'
      }
    ];
    setRecentReviews(mockReviews);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.driverName.trim()) newErrors.driverName = 'Name is required';
    if (!profileData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(profileData.phone)) newErrors.phone = 'Invalid phone number';
    
    if (!profileData.salaryPerDay) newErrors.salaryPerDay = 'Salary is required';
    else if (profileData.salaryPerDay < 500) newErrors.salaryPerDay = 'Minimum ₹500 required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profileImage') {
      setProfileData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEditMode(false);
      showNotification('Profile updated successfully!', 'success');
      
      // Update user context if needed
      if (setUser) {
        const updatedUser = {
          ...user,
          name: profileData.driverName,
          phone: profileData.phone
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      showNotification('Failed to update profile. Please try again.', 'error');
    }
    
    setLoading(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="container">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profileData.profileImage ? (
                <img 
                  src={URL.createObjectURL(profileData.profileImage)} 
                  alt="Profile"
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initials">
                  {profileData.driverName.charAt(0)}
                </span>
              )}
              
              {editMode && (
                <div className="avatar-upload">
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    onChange={handleChange}
                    accept="image/*"
                    className="file-input"
                  />
                  <label htmlFor="profileImage" className="upload-btn">
                    📷
                  </label>
                </div>
              )}
            </div>
            
            <div className="profile-basic-info">
              <h1 className="profile-name">{profileData.driverName}</h1>
              <p className="profile-location">📍 {profileData.city}, {profileData.district}</p>
              <div className="availability-status">
                <span className={`status-indicator ${profileData.availability === 'Available' ? 'available' : 'busy'}`}>
                  {profileData.availability === 'Available' ? '🟢' : '🔴'}
                </span>
                {profileData.availability}
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            {!editMode ? (
              <button 
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-icon">🚗</div>
            <div className="stat-value">{profileStats.totalTrips}</div>
            <div className="stat-label">Total Trips</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{profileStats.averageRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{profileStats.totalEarnings.toLocaleString()}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{profileStats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews ({recentReviews.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            📄 Documents
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-tab fade-in">
              <div className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>👤 Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="driverName"
                        value={profileData.driverName}
                        onChange={handleChange}
                        className={`form-control ${errors.driverName ? 'error' : ''}`}
                      />
                    ) : (
                      <div className="form-display">{profileData.driverName}</div>
                    )}
                    {errors.driverName && <div className="error-text">{errors.driverName}</div>}
                  </div>

                  <div className="form-group">
                    <label>📧 Email Address</label>
                    <div className="form-display">{profileData.email}</div>
                    <small className="form-help">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>📱 Phone Number</label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        className={`form-control ${errors.phone ? 'error' : ''}`}
                        maxLength="10"
                      />
                    ) : (
                      <div className="form-display">{profileData.phone}</div>
                    )}
                    {errors.phone && <div className="error-text">{errors.phone}</div>}
                  </div>

                  <div className="form-group">
                    <label>🆔 License Number</label>
                    <div className="form-display">{profileData.licenseNumber}</div>
                    <small className="form-help">License number cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>🏎️ Years of Experience</label>
                    {editMode ? (
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={profileData.yearsOfExperience}
                        onChange={handleChange}
                        className="form-control"
                        min="1"
                        max="50"
                      />
                    ) : (
                      <div className="form-display">{profileData.yearsOfExperience} years</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>🏙️ District</label>
                    {editMode ? (
                      <select
                        name="district"
                        value={profileData.district}
                        onChange={handleChange}
                        className="form-control"
                      >
                        {tamilNaduDistricts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="form-display">{profileData.district}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>🏘️ City</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      <div className="form-display">{profileData.city}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>🚗 Specialization</label>
                    {editMode ? (
                      <select
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="Long Distance Driving">Long Distance Driving</option>
                        <option value="City Driving">City Driving</option>
                        <option value="Night Driving">Night Driving</option>
                        <option value="Luxury Vehicle">Luxury Vehicle</option>
                        <option value="Commercial Vehicle">Commercial Vehicle</option>
                        <option value="Stunt Driving">Stunt Driving</option>
                      </select>
                    ) : (
                      <div className="form-display">{profileData.specialization}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>💰 Salary Per Day (₹)</label>
                    {editMode ? (
                      <input
                        type="number"
                        name="salaryPerDay"
                        value={profileData.salaryPerDay}
                        onChange={handleChange}
                        className={`form-control ${errors.salaryPerDay ? 'error' : ''}`}
                        min="500"
                      />
                    ) : (
                      <div className="form-display">₹{profileData.salaryPerDay}</div>
                    )}
                    {errors.salaryPerDay && <div className="error-text">{errors.salaryPerDay}</div>}
                  </div>

                  <div className="form-group">
                    <label>🏥 Health Status</label>
                    {editMode ? (
                      <select
                        name="healthStatus"
                        value={profileData.healthStatus}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    ) : (
                      <div className="form-display">
                        <span className={`health-indicator ${profileData.healthStatus.toLowerCase()}`}>
                          {profileData.healthStatus === 'Excellent' && '💚'}
                          {profileData.healthStatus === 'Good' && '💛'}
                          {profileData.healthStatus === 'Fair' && '🧡'}
                        </span>
                        {profileData.healthStatus}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab fade-in">
              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="overall-rating">
                    <div className="rating-number">{profileStats.averageRating}</div>
                    <div className="rating-stars">
                      {renderStars(Math.floor(profileStats.averageRating))}
                    </div>
                    <div className="rating-count">Based on {recentReviews.length} reviews</div>
                  </div>
                  
                  <div className="rating-breakdown">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="rating-bar">
                        <span className="star-label">{star} ⭐</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${star === 5 ? 70 : star === 4 ? 25 : 5}%` }}
                          ></div>
                        </div>
                        <span className="bar-percentage">
                          {star === 5 ? 70 : star === 4 ? 25 : 5}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="reviews-list">
                {recentReviews.map((review, index) => (
                  <div 
                    key={review.id} 
                    className="review-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.customerName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="reviewer-name">{review.customerName}</h4>
                          <p className="review-date">{review.date}</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    
                    <div className="review-body">
                      <p className="review-comment">"{review.comment}"</p>
                      <div className="trip-info">
                        <span className="trip-type">🚗 {review.tripType}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="documents-tab fade-in">
              <div className="documents-grid">
                <div className="document-card">
                  <div className="document-icon">🆔</div>
                  <div className="document-info">
                    <h4>Driving License</h4>
                    <p>License No: {profileData.licenseNumber}</p>
                    <span className="document-status verified">✅ Verified</span>
                  </div>
                  <button className="btn btn-secondary document-btn">
                    👁️ View
                  </button>
                </div>

                <div className="document-card">
                  <div className="document-icon">📋</div>
                  <div className="document-info">
                    <h4>Vehicle Registration</h4>
                    <p>Registration documents</p>
                    <span className="document-status pending">⏳ Pending</span>
                  </div>
                  <button className="btn btn-primary document-btn">
                    📤 Upload
                  </button>
                </div>

                <div className="document-card">
                  <div className="document-icon">🏥</div>
                  <div className="document-info">
                    <h4>Medical Certificate</h4>
                    <p>Health clearance certificate</p>
                    <span className="document-status verified">✅ Verified</span>
                  </div>
                  <button className="btn btn-secondary document-btn">
                    👁️ View
                  </button>
                </div>

                <div className="document-card">
                  <div className="document-icon">🛡️</div>
                  <div className="document-info">
                    <h4>Insurance Papers</h4>
                    <p>Vehicle insurance documents</p>
                    <span className="document-status verified">✅ Verified</span>
                  </div>
                  <button className="btn btn-secondary document-btn">
                    👁️ View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
