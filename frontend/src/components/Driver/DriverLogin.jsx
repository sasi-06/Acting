import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driverAPI } from '../../services/api';

const DriverLogin = ({ setUser, showNotification }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  
  try {
    const response = await driverAPI.login({
      email: formData.email,
      password: formData.password
    });

    const userData = {
      ...response.data.driver,
      userType: 'driver'
    };
    const token = response.data.token;

    // REMOVED: All localStorage operations
    setUser(userData, token); // This calls the login function from App.jsx
    
    showNotification('Welcome back! Login successful.', 'success');
    navigate('/driver/dashboard');
    
  } catch (error) {
    setLoginAttempts(prev => prev + 1);
    const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
    showNotification(errorMessage, 'error');
    
    const form = document.querySelector('.form-container');
    if (form) {
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = () => {
    showNotification('Password reset link will be sent to your email', 'info');
  };

  return (
    <div className="container">
      <div className="login-wrapper">
        <div className="login-visual">
          <div className="visual-content">
            <div className="car-animation">
              <div className="car">🚗</div>
              <div className="road"></div>
            </div>
            <h2>Welcome Back, Driver!</h2>
            <p>Ready to hit the road and take on new acting projects?</p>
            <div className="features-list">
              <div className="feature-item">✅ Manage your availability</div>
              <div className="feature-item">✅ View booking requests</div>
              <div className="feature-item">✅ Track your earnings</div>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="login-header">
            <h2 className="form-title">🚗 Driver Login</h2>
            <p className="form-subtitle">Access your driver dashboard</p>
          </div>

          {loginAttempts >= 3 && (
            <div className="security-alert">
              <span className="alert-icon">🔒</span>
              <span>Multiple failed attempts detected. Please check your credentials.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group floating-label">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder=" "
                autoComplete="email"
              />
              <label htmlFor="email">📧 Email Address</label>
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className="form-group floating-label">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder=" "
                autoComplete="current-password"
              />
              <label htmlFor="password">🔒 Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              
              <button 
                type="button" 
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span>🚀 Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <div className="divider">
              <span>New to Acting Driver?</span>
            </div>
            <Link to="/driver/register" className="btn btn-secondary btn-full">
              📝 Create Driver Account
            </Link>
          </div>

          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Email:</strong> driver@test.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 80vh;
          gap: 40px;
          align-items: center;
          margin: 40px 0;
        }

        .login-visual {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .visual-content h2 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 20px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .visual-content p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          margin-bottom: 40px;
        }

        .car-animation {
          position: relative;
          margin: 40px 0;
          height: 100px;
        }

        .car {
          font-size: 3rem;
          animation: drive 3s ease-in-out infinite;
          position: absolute;
          top: 20px;
          left: 0;
        }

        .road {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: repeating-linear-gradient(
            to right,
            white 0,
            white 20px,
            transparent 20px,
            transparent 40px
          );
          animation: roadMove 2s linear infinite;
        }

        @keyframes drive {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(50px) rotate(2deg); }
          50% { transform: translateX(100px) rotate(0deg); }
          75% { transform: translateX(150px) rotate(-2deg); }
          100% { transform: translateX(200px) rotate(0deg); }
        }

        @keyframes roadMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }

        .features-list {
          text-align: left;
          max-width: 300px;
          margin: 0 auto;
        }

        .feature-item {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 15px;
          font-size: 1.1rem;
          animation: slideInLeft 0.5s ease-out;
        }

        .feature-item:nth-child(1) { animation-delay: 0.2s; }
        .feature-item:nth-child(2) { animation-delay: 0.4s; }
        .feature-item:nth-child(3) { animation-delay: 0.6s; }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .form-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-subtitle {
          color: #666;
          margin-top: 10px;
        }

        .floating-label {
          position: relative;
          margin-bottom: 25px;
        }

        .floating-label input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 16px;
          background: transparent;
          transition: all 0.3s ease;
        }

        .floating-label input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }

        .floating-label label {
          position: absolute;
          left: 15px;
          top: 15px;
          transition: all 0.3s ease;
          pointer-events: none;
          color: #666;
          background: white;
          padding: 0 8px;
          border-radius: 4px;
        }

        .floating-label input:focus + label,
        .floating-label input:not(:placeholder-shown) + label {
          transform: translateY(-32px) scale(0.85);
          color: #667eea;
          font-weight: 600;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .password-toggle:hover {
          transform: translateY(-50%) scale(1.2);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #555;
        }

        .checkbox-container input {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-radius: 4px;
          margin-right: 10px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-container input:checked + .checkmark {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-color: #667eea;
        }

        .checkbox-container input:checked + .checkmark:after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .forgot-password {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-password:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .login-btn {
          position: relative;
          overflow: hidden;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .login-btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .login-btn:hover:before {
          left: 100%;
        }

        .security-alert {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #856404;
          animation: pulse 2s infinite;
        }

        .alert-icon {
          font-size: 1.2rem;
        }

        .divider {
          text-align: center;
          margin: 30px 0 20px;
          position: relative;
          color: #666;
        }

        .divider:before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e9ecef;
          z-index: 1;
        }

        .divider span {
          background: white;
          padding: 0 15px;
          position: relative;
          z-index: 2;
        }

        .demo-credentials {
          margin-top: 30px;
          padding: 20px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .demo-credentials h4 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .demo-credentials p {
          color: #555;
          font-size: 0.85rem;
          margin-bottom: 5px;
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 20%, 40%, 60%, 80% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 968px) {
          .login-wrapper {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .login-visual {
            order: 2;
            padding: 40px 30px;
          }
          
          .visual-content h2 {
            font-size: 2rem;
          }
          
          .car-animation {
            height: 80px;
          }
          
          .car {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 25px;
            margin: 10px;
          }
          
          .form-options {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverLogin;