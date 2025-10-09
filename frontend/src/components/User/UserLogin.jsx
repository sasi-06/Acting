import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userAPI } from '../../services/api';
import "./UserLogin.css";

const UserLogin = ({ setUser, showNotification, user }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const renderCount = useRef(0);
  const hasRedirected = useRef(false);

  // DEBUG: Track renders
  renderCount.current += 1;
  console.log('🔄 UserLogin Render #', renderCount.current);
  console.log('📦 Props:', { 
    hasUser: !!user, 
    userType: user?.userType,
    setUserType: typeof setUser,
    showNotificationType: typeof showNotification 
  });

  // COMPLETELY DISABLE redirect for testing
  /*
  useEffect(() => {
    if (user && user.userType === 'user' && !hasRedirected.current) {
      hasRedirected.current = true;
      const from = location.state?.from || '/user/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate]);
  */

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Attempting login with:', formData.email);
      
      const response = await userAPI.login(formData);
      const data = response.data;

      console.log('Login response:', data);

      if (!data.token) {
        throw new Error("Login failed: No token returned from server");
      }

      if (!data.user) {
        throw new Error("Login failed: No user data returned from server");
      }

      if (!data.user.userType) {
        data.user.userType = 'user';
      }

      console.log('🎯 Calling setUser...');
      setUser(data.user, data.token);
      console.log('✅ setUser called');

      showNotification(`Welcome back, ${data.user.name || 'User'}! Login successful.`, "success");

      // Manual navigation for testing
      console.log('🚀 Navigating to dashboard...');
      setTimeout(() => {
        navigate('/user/dashboard', { replace: true });
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      
      const errorMsg = error.response?.data?.message 
        || error.message 
        || "Login failed! Please check your credentials.";
      
      showNotification(errorMsg, "error");
      setLoginAttempts((prev) => prev + 1);

      const form = document.querySelector(".form-container");
      if (form) {
        form.classList.add("shake");
        setTimeout(() => form.classList.remove("shake"), 500);
      }

      setFormData(prev => ({ ...prev, password: '' }));
      
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showNotification('Password reset link will be sent to your email', 'info');
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'user@test.com',
      password: 'password123'
    });
    showNotification('Demo credentials filled!', 'info');
  };

  // Show render count on screen for debugging
  return (
    <div className="container">
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '20px',
        background: 'rgba(255,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10000,
        fontFamily: 'monospace'
      }}>
        Renders: {renderCount.current}
      </div>
      
      <div className="login-wrapper">
        <div className="login-visual">
          <div className="visual-content">
            <div className="movie-scene">
              <div className="clapperboard">🚗</div>
              <div className="camera">🚗</div>
              <div className="director-chair">🚗</div>
            </div>
            <h2>Welcome Back, User!</h2>
            <p>Ready to book your next acting driver for the perfect shot?</p>
            <div className="features-list">
              <div className="feature-item">⭐ Find professional acting drivers</div>
              <div className="feature-item">⭐ Rate and review drivers</div>
              <div className="feature-item">⭐ Track your bookings</div>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="login-header">
            <h2 className="form-title">🎭 Customer Login</h2>
            <p className="form-subtitle">Access your booking dashboard</p>
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
                disabled={loading}
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
                disabled={loading}
              />
              <label htmlFor="password">🔒 Password</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>

            <div className="form-options">
              <button 
                type="button" 
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={loading}
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
                  <span>🎬 Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <div className="divider">
              <span>New to Acting Driver?</span>
            </div>
            <Link to="/user/register" className="btn btn-secondary btn-full">
              📝 Create Customer Account
            </Link>
          </div>

          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Email:</strong> user@test.com</p>
            <p><strong>Password:</strong> password123</p>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={fillDemoCredentials}
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '6px',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
            >
              Use Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;