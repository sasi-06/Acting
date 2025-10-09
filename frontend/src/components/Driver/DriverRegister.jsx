import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driverAPI } from '../../services/api';
import './DriverRegister.css';

const DriverRegister = ({ setUser, showNotification }) => {
  const [formData, setFormData] = useState({
    driverName: '',
    licenseNumber: '',
    phone: '',
    email: '',
    yearsOfExperience: '',
    dob: '',
    licenseCopy: null,
    district: '',
    city: '',
    availability: 'Available',
    healthStatus: 'Good',
    specialization: '',
    password: '',
    confirmPassword: '',
    salaryPerDay: ''
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
    'Namakkal', 'Krishnagiri', 'Dharmapuri', 'Pudukkottai', 'Ramanathapuram',
    'Sivaganga', 'Viluppuram', 'Tiruvannamalai', 'Nagapattinam', 'Ariyalur',
    'Perambalur', 'Kallakurichi', 'Ranipet', 'Tirupathur', 'Tenkasi',
    'Chengalpattu', 'Tiruvallur', 'Mayiladuthurai'
  ];

  // NEW: Validate specific step
  const validateStep = (stepNumber) => {
    const newErrors = {};

    // Step 1 validations
    if (stepNumber === 1) {
      if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid Indian phone number';
      
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      else {
        const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
        if (age < 21 || age > 65) newErrors.dob = 'Age must be between 21 and 65';
      }
    }

    // Step 2 validations
    if (stepNumber === 2) {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
      else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11}$/.test(formData.licenseNumber)) {
        newErrors.licenseNumber = 'Invalid license format (e.g., TN01AB12CD34567)';
      }
      
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Experience is required';
      else if (formData.yearsOfExperience < 1) newErrors.yearsOfExperience = 'Minimum 1 year experience required';
      
      if (!formData.district) newErrors.district = 'District is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.salaryPerDay) newErrors.salaryPerDay = 'Salary per day is required';
      else if (formData.salaryPerDay < 500) newErrors.salaryPerDay = 'Minimum salary should be ₹500';
    }

    // Step 3 validations
    if (stepNumber === 3) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.licenseCopy) newErrors.licenseCopy = 'License copy is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // NEW: Validate all steps before final submission
  const validateAllSteps = () => {
    let allErrors = {};

    // Validate Step 1
    if (!formData.driverName.trim()) allErrors.driverName = 'Driver name is required';
    if (!formData.email.trim()) allErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) allErrors.email = 'Email is invalid';
    
    if (!formData.phone.trim()) allErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) allErrors.phone = 'Invalid Indian phone number';
    
    if (!formData.dob) allErrors.dob = 'Date of birth is required';
    else {
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
      if (age < 21 || age > 65) allErrors.dob = 'Age must be between 21 and 65';
    }

    // Validate Step 2
    if (!formData.licenseNumber.trim()) allErrors.licenseNumber = 'License number is required';
    else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11}$/.test(formData.licenseNumber)) {
      allErrors.licenseNumber = 'Invalid license format (e.g., TN01AB12CD34567)';
    }
    
    if (!formData.yearsOfExperience) allErrors.yearsOfExperience = 'Experience is required';
    else if (formData.yearsOfExperience < 1) allErrors.yearsOfExperience = 'Minimum 1 year experience required';
    
    if (!formData.district) allErrors.district = 'District is required';
    if (!formData.city.trim()) allErrors.city = 'City is required';
    if (!formData.salaryPerDay) allErrors.salaryPerDay = 'Salary per day is required';
    else if (formData.salaryPerDay < 500) allErrors.salaryPerDay = 'Minimum salary should be ₹500';

    // Validate Step 3
    if (!formData.password) allErrors.password = 'Password is required';
    else if (formData.password.length < 8) allErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      allErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      allErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.licenseCopy) allErrors.licenseCopy = 'License copy is required';

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Find which step has errors and go to that step
      if (allErrors.driverName || allErrors.email || allErrors.phone || allErrors.dob) {
        setStep(1);
        showNotification('Please complete all fields in Personal Info', 'error');
      } else if (allErrors.licenseNumber || allErrors.yearsOfExperience || allErrors.district || 
                 allErrors.city || allErrors.salaryPerDay) {
        setStep(2);
        showNotification('Please complete all fields in Professional Info', 'error');
      } else {
        showNotification('Please fix validation errors', 'error');
      }
      return false;
    }

    return true;
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
    const { name, value, files } = e.target;
    
    if (name === 'licenseCopy') {
      const file = files[0];
      // Validate file size (max 5MB)
      if (file && file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, licenseCopy: 'File size must be less than 5MB' }));
        e.target.value = null; // Clear the input
        return;
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (file && !validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, licenseCopy: 'Only JPG, PNG, or PDF files are allowed' }));
        e.target.value = null;
        return;
      }
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FIXED: Validate all steps before submission
    if (!validateAllSteps()) {
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('driverName', formData.driverName);
      form.append('licenseNumber', formData.licenseNumber);
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('yearsOfExperience', formData.yearsOfExperience);
      form.append('dob', formData.dob);
      form.append('district', formData.district);
      form.append('city', formData.city);
      form.append('availability', formData.availability);
      form.append('healthStatus', formData.healthStatus);
      form.append('specialization', formData.specialization);
      form.append('password', formData.password);
      form.append('salaryPerDay', formData.salaryPerDay);
      
      if (formData.licenseCopy) {
        form.append('licenseCopy', formData.licenseCopy);
      }

      const response = await driverAPI.register(form);

      showNotification('Registration successful!', 'success');
      navigate('/driver/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      showNotification('Registration error: ' + errorMessage, 'error');
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
    <div className="driver-register-page">
    <div className="container">
      <div className="form-container">
        <div className="registration-header">
          <h2 className="form-title"> Driver Registration</h2>
          <div className="progress-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Personal Info</div>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Professional Info</div>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Security & Documents</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="step-content fade-in">
              <h3 className="step-title">Personal Information</h3>
              
              <div className="form-group">
                <label htmlFor="driverName">Full Name *</label>
                <input
                  type="text"
                  id="driverName"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className={`form-control ${errors.driverName ? 'error' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.driverName && <div className="error-text">{errors.driverName}</div>}
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
                <label htmlFor="dob">Date of Birth *</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`form-control ${errors.dob ? 'error' : ''}`}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
                />
                {errors.dob && <div className="error-text">{errors.dob}</div>}
                <small className="form-text text-muted">
                  Please enter a date of birth between&nbsp;
                  {new Date(new Date().setFullYear(new Date().getFullYear() - 65)).toLocaleDateString()} 
                  and {new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toLocaleDateString()}.
                </small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary btn-full" onClick={handleNext}>
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Professional Information */}
          {step === 2 && (
            <div className="step-content fade-in">
              <h3 className="step-title">Professional Information</h3>
              
              <div className="form-group">
                <label htmlFor="licenseNumber">Driving License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className={`form-control ${errors.licenseNumber ? 'error' : ''}`}
                  placeholder="TN01AB12CD34567"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.licenseNumber && <div className="error-text">{errors.licenseNumber}</div>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="yearsOfExperience">Years of Experience *</label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className={`form-control ${errors.yearsOfExperience ? 'error' : ''}`}
                    placeholder="5"
                    min="1"
                    max="50"
                  />
                  {errors.yearsOfExperience && <div className="error-text">{errors.yearsOfExperience}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="salaryPerDay">Salary Per Day (₹) *</label>
                  <input
                    type="number"
                    id="salaryPerDay"
                    name="salaryPerDay"
                    value={formData.salaryPerDay}
                    onChange={handleChange}
                    className={`form-control ${errors.salaryPerDay ? 'error' : ''}`}
                    placeholder="1500"
                    min="500"
                  />
                  {errors.salaryPerDay && <div className="error-text">{errors.salaryPerDay}</div>}
                </div>
              </div>

              <div className="form-grid">
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

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`form-control ${errors.city ? 'error' : ''}`}
                    placeholder="Enter your city"
                  />
                  {errors.city && <div className="error-text">{errors.city}</div>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="healthStatus">Health Status</label>
                  <select
                    id="healthStatus"
                    name="healthStatus"
                    value={formData.healthStatus}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="availability">Current Availability</label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Specialization</option>
                  <option value="Long Distance Driving">Long Distance Driving</option>
                  <option value="City Driving">City Driving</option>
                  <option value="Night Driving">Night Driving</option>
                  <option value="Luxury Vehicle">Luxury Vehicle</option>
                  <option value="Commercial Vehicle">Commercial Vehicle</option>
                  <option value="Stunt Driving">Stunt Driving</option>
                </select>
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

          {/* Step 3: Security & Documents */}
          {step === 3 && (
            <div className="step-content fade-in">
              <h3 className="step-title">Security & Documents</h3>
              
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

              <div className="form-group">
                <label htmlFor="licenseCopy">Upload License Copy *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="licenseCopy"
                    name="licenseCopy"
                    onChange={handleChange}
                    className="file-input"
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="licenseCopy" className="file-label">
                    <span className="file-icon">📄</span>
                    {formData.licenseCopy ? formData.licenseCopy.name : 'Choose file...'}
                  </label>
                </div>
                {errors.licenseCopy && <div className="error-text">{errors.licenseCopy}</div>}
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
          <p>Already have an account? <Link to="/driver/login" className="link">Login here</Link></p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DriverRegister;