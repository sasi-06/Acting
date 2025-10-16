import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api.js';

import "./UserRegister.css";
const UserRegister = ({ setUser, showNotification }) => {
  const [formData, setFormData] = useState({
    username: '',
    district: '',
    phone: '',
    email: '',
    pickupLocation: '',
    dropLocation: '',
    tripStartDateTime: '',
    tripEndDateTime: '',
    vehicleType: '',
    carCompany: '',
    numberOfPersons: '',
    carNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const tamilNaduDistricts = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Vellore', 'Erode', 'Kanchipuram', 'Thoothukudi', 'Dindigul', 'Thanjavur',
    'Cuddalore', 'Kanyakumari', 'Virudhunagar', 'Karur', 'The Nilgiris',
    'Namakkal', 'Krishnagiri', 'Dharmapuri', 'Pudukkottai', 'Ramanathapuram'
  ];

  const vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'Luxury Car', 'Van', 'Bus'];
  const carCompanies = [
    'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 'Honda', 'Toyota',
    'Ford', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'
  ];

  const validateForm = () => {
    const newErrors = {};

    // Step 1 validations
    if (step === 1) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid Indian phone number';

      if (!formData.district) newErrors.district = 'District is required';
    }

    // Step 2 validations
    if (step === 2) {
      if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
      if (!formData.dropLocation.trim()) newErrors.dropLocation = 'Drop location is required';
      if (!formData.tripStartDateTime) newErrors.tripStartDateTime = 'Trip start date & time is required';
      if (!formData.tripEndDateTime) newErrors.tripEndDateTime = 'Trip end date & time is required';

      if (formData.tripStartDateTime && formData.tripEndDateTime) {
        if (new Date(formData.tripStartDateTime) >= new Date(formData.tripEndDateTime)) {
          newErrors.tripEndDateTime = 'End time must be after start time';
        }
      }
    }

    // Step 3 validations
    if (step === 3) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (!formData.carCompany) newErrors.carCompany = 'Car company is required';
      if (!formData.numberOfPersons) newErrors.numberOfPersons = 'Number of persons is required';
      else if (formData.numberOfPersons < 1) newErrors.numberOfPersons = 'At least 1 person required';

      if (!formData.carNumber.trim()) newErrors.carNumber = 'Car number is required';
      else if (!/^TN[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(formData.carNumber)) {
        newErrors.carNumber = 'Invalid Tamil Nadu car number format (e.g., TN01AB1234)';
      }

      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (name === 'carNumber') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerUser(formData);
      // handle success (e.g., show notification, redirect)
      showNotification('Registration successful!', 'success');
      // ...other logic...
    } catch (error) {
      showNotification('Registration error: ' + (error.response?.data?.message || error.message), 'error');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };


  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return '#dc3545';
    if (passwordStrength < 60) return '#ffc107';
    if (passwordStrength < 80) return '#fd7e14';
    return '#28a745';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="registration-header">
          <h2 className="form-title">🎭 Customer Registration</h2>
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Personal Info</div>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Trip Details</div>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Vehicle & Security</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="step-content fade-in">
              <h3 className="step-title">Personal Information</h3>

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-control ${errors.username ? 'error' : ''}`}
                  placeholder="Enter your username"
                />
                {errors.username && <div className="error-text">{errors.username}</div>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <div className="error-text">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-control ${errors.phone ? 'error' : ''}`}
                    placeholder="9876543210"
                    maxLength="10"
                  />
                  {errors.phone && <div className="error-text">{errors.phone}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="district">District *</label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`form-control ${errors.district ? 'error' : ''}`}
                >
                  <option value="">Select District</option>
                  {tamilNaduDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && <div className="error-text">{errors.district}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary btn-full" onClick={handleNext}>
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Trip Details */}
          {/* Step 2: Trip Details */}
          {step === 2 && (
            <div className="step-content fade-in">
              <h3 className="step-title">Trip Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="pickupLocation" title="Where should the driver pick you up?">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className={`form-control ${errors.pickupLocation ? 'error' : ''}`}
                    placeholder="Enter pickup city (e.g., Chennai Central)"
                  />
                  <small className="helper-text">Example: Chennai Central Railway Station</small>
                  {errors.pickupLocation && <div className="error-text">{errors.pickupLocation}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="dropLocation" title="Where should the driver drop you?">
                    Drop Location *
                  </label>
                  <input
                    type="text"
                    id="dropLocation"
                    name="dropLocation"
                    value={formData.dropLocation}
                    onChange={handleChange}
                    className={`form-control ${errors.dropLocation ? 'error' : ''}`}
                    placeholder="Enter drop city (e.g., Bengaluru Airport)"
                  />
                  <small className="helper-text">Example: Kempegowda International Airport</small>
                  {errors.dropLocation && <div className="error-text">{errors.dropLocation}</div>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tripStartDateTime" title="When does your journey start?">
                    Trip Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="tripStartDateTime"
                    name="tripStartDateTime"
                    value={formData.tripStartDateTime}
                    onChange={handleChange}
                    className={`form-control ${errors.tripStartDateTime ? 'error' : ''}`}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small className="helper-text">Select the exact date and time when your trip begins.</small>
                  {errors.tripStartDateTime && <div className="error-text">{errors.tripStartDateTime}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="tripEndDateTime" title="When does your journey end?">
                    Trip End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="tripEndDateTime"
                    name="tripEndDateTime"
                    value={formData.tripEndDateTime}
                    onChange={handleChange}
                    className={`form-control ${errors.tripEndDateTime ? 'error' : ''}`}
                    min={formData.tripStartDateTime || new Date().toISOString().slice(0, 16)}
                  />
                  <small className="helper-text">Select the date and time when your trip will finish.</small>
                  {errors.tripEndDateTime && <div className="error-text">{errors.tripEndDateTime}</div>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                  ← Previous
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next Step →
                </button>
              </div>
            </div>
          )}


          {/* Step 3: Vehicle & Security */}
          {step === 3 && (
            <div className="step-content fade-in">
              <h3 className="step-title">Vehicle & Security Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vehicleType">Vehicle Type *</label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className={`form-control ${errors.vehicleType ? 'error' : ''}`}
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.vehicleType && <div className="error-text">{errors.vehicleType}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="carCompany">Car Company *</label>
                  <select
                    id="carCompany"
                    name="carCompany"
                    value={formData.carCompany}
                    onChange={handleChange}
                    className={`form-control ${errors.carCompany ? 'error' : ''}`}
                  >
                    <option value="">Select Car Company</option>
                    {carCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                  {errors.carCompany && <div className="error-text">{errors.carCompany}</div>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="numberOfPersons">Number of Passengers *</label>
                  <input
                    type="number"
                    id="numberOfPersons"
                    name="numberOfPersons"
                    value={formData.numberOfPersons}
                    onChange={handleChange}
                    className={`form-control ${errors.numberOfPersons ? 'error' : ''}`}
                    placeholder="Number of persons"
                    min="1"
                    max="20"
                  />
                  {errors.numberOfPersons && <div className="error-text">{errors.numberOfPersons}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="carNumber">Car Number (Tamil Nadu) *</label>
                  <input
                    type="text"
                    id="carNumber"
                    name="carNumber"
                    value={formData.carNumber}
                    onChange={handleChange}
                    className={`form-control ${errors.carNumber ? 'error' : ''}`}
                    placeholder="TN01AB1234"
                    maxLength="10"
                  />
                  {errors.carNumber && <div className="error-text">{errors.carNumber}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                />
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="strength-label" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                )}
                {errors.password && <div className="error-text">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                  ← Previous
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="form-footer">
          <p>Already have an account? <Link to="/user/login" className="link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;