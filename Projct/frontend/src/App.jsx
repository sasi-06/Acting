// App.js
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Common Components
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import Home from './components/Common/Home';
import Loading from './components/Common/Loading';
import Notification from './components/Common/Notification';

// Lazy load route components
const DriverRegister = lazy(() => import('./components/Driver/DriverRegister'));
const DriverLogin = lazy(() => import('./components/Driver/DriverLogin'));
const DriverDashboard = lazy(() => import('./components/Driver/DriverDashboard'));
const DriverProfile = lazy(() => import('./components/Driver/DriverProfile'));
const DriverBookings = lazy(() => import('./components/Driver/DriverBookings'));

const UserRegister = lazy(() => import('./components/User/UserRegister'));
const UserLogin = lazy(() => import('./components/User/UserLogin'));

const UserDashboard = lazy(() => import('./components/User/UserDashboard'));
const BookingForm = lazy(() => import('./components/User/BookingForm'));
const UserBookings = lazy(() => import('./components/User/UserBookings'));
const SearchDrivers = lazy(() => import('./components/User/SearchDrivers'));

const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminDrivers = lazy(() => import('./components/Admin/AdminDrivers'));
const AdminUsers = lazy(() => import('./components/Admin/AdminUsers'));
const AdminBookings = lazy(() => import('./components/Admin/AdminBookings'));

import './App.css';

// Constants
const NOTIFICATION_TIMEOUT = 5000;
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Simple Loading Fallback Component
const LoadingFallback = ({ message = "Loading..." }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)',
    color: 'white',
    textAlign: 'center'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }} />
    <p>{message}</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1>Something went wrong!</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ProtectedRoute wrapper
const ProtectedRoute = ({ children, isAuthenticated, user, allowedUserTypes, redirectTo }) => {
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  const isUserTypeAllowed = allowedUserTypes.length === 0 || allowedUserTypes.includes(user.userType);

  if (!isUserTypeAllowed) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dc2626 10%, #1e3a8a 50%, #000000 90%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(30, 58, 138, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px'
        }}>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p>Your account type: {user.userType}</p>
          <button onClick={() => window.location.href = getRedirectPath(user.userType)} style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const getRedirectPath = (userType) => {
  switch (userType) {
    case 'admin': return '/admin/dashboard';
    case 'driver': return '/driver/dashboard';
    case 'user': return '/user/dashboard';
    default: return '/';
  }
};

// FIXED Auth Hook - Stable callbacks
const useAuth = () => {
  const [authState, setAuthState] = useState({ 
    user: null, 
    isAuthenticated: false, 
    loading: true, 
    lastActivity: null 
  });
  const navigate = useNavigate();
  
  // Use ref to store latest values without causing re-renders
  const lastActivityRef = useRef(null);

  const isSessionValid = useCallback(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;
    const timeDiff = Date.now() - parseInt(lastActivity);
    return timeDiff < SESSION_TIMEOUT;
  }, []);

  const updateLastActivity = useCallback(() => {
    const now = Date.now().toString();
    localStorage.setItem('lastActivity', now);
    lastActivityRef.current = now;
  }, []); // FIXED: No dependencies - stable function

  // Initialize auth on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData && isSessionValid()) {
        const user = JSON.parse(userData);
        const lastActivity = localStorage.getItem('lastActivity');
        setAuthState({ 
          user, 
          isAuthenticated: true, 
          loading: false, 
          lastActivity 
        });
        updateLastActivity();
      } else {
        localStorage.clear();
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []); // FIXED: Run only once on mount

  // Session timeout check
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (!isSessionValid()) {
        localStorage.clear();
        setAuthState({ user: null, isAuthenticated: false, loading: false, lastActivity: null });
        navigate('/', { replace: true });
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, isSessionValid, navigate]);

  // Activity tracking
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    
    const handleActivity = () => updateLastActivity();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => document.addEventListener(event, handleActivity, true));
    return () => events.forEach(event => document.removeEventListener(event, handleActivity, true));
  }, [authState.isAuthenticated, updateLastActivity]);

  // FIXED: Stable login function with no changing dependencies
  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    const now = Date.now().toString();
    localStorage.setItem('lastActivity', now);
    lastActivityRef.current = now;
    
    setAuthState({ 
      user: userData, 
      isAuthenticated: true, 
      loading: false, 
      lastActivity: now 
    });
  }, []); // FIXED: Empty dependencies - completely stable

  // FIXED: Stable logout function
  const logout = useCallback(() => {
    localStorage.clear();
    setAuthState({ user: null, isAuthenticated: false, loading: false, lastActivity: null });
    navigate('/', { replace: true });
  }, [navigate]);

  // FIXED: Stable updateUser function
  const updateUser = useCallback((updatedUserData) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      const newUserData = { ...prev.user, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUserData));
      return { ...prev, user: newUserData };
    });
  }, []); // FIXED: Empty dependencies - completely stable

  return { 
    ...authState, 
    login, 
    logout, 
    updateUser, 
    updateLastActivity 
  };
};

// Notification Hook
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);
  
  const addNotification = useCallback((message, type = 'info', duration = NOTIFICATION_TIMEOUT) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => removeNotification(id), duration);
    return id;
  }, [removeNotification]);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return { notifications, addNotification, removeNotification, clearAllNotifications };
};

const PageWithFooter = ({ children, className = '' }) => {
  const location = useLocation();
  const pageClass = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin/')) return 'admin-page';
    if (path.includes('/driver/')) return 'driver-page';
    if (path.includes('/user/')) return 'user-page';
    return 'public-page';
  }, [location.pathname]);
  
  return (
    <div className={`page-wrapper ${pageClass} ${className}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
};

const SuspenseWrapper = ({ children, fallback = <LoadingFallback message="Loading component..." /> }) => (
  <Suspense fallback={fallback}>
    <ErrorBoundary>{children}</ErrorBoundary>
  </Suspense>
);

export default function App() {
  const auth = useAuth();
  const notification = useNotification();
  const location = useLocation();

  // Memoize these to prevent unnecessary re-renders
  const createProtectedRoute = useCallback((Component, allowedUserTypes, redirectTo) => (
    <ProtectedRoute 
      isAuthenticated={auth.isAuthenticated} 
      user={auth.user} 
      allowedUserTypes={allowedUserTypes} 
      redirectTo={redirectTo}
    >
      <PageWithFooter>
        <SuspenseWrapper>
          <Component 
            user={auth.user} 
            setUser={auth.updateUser} 
            showNotification={notification.addNotification} 
            updateLastActivity={auth.updateLastActivity} 
          />
        </SuspenseWrapper>
      </PageWithFooter>
    </ProtectedRoute>
  ), [auth.isAuthenticated, auth.user, auth.updateUser, auth.updateLastActivity, notification.addNotification]);

  const createPublicRoute = useCallback((Component, props = {}) => (
    <PageWithFooter>
      <SuspenseWrapper>
        <Component 
          setUser={auth.login} 
          user={auth.user} 
          showNotification={notification.addNotification} 
          {...props} 
        />
      </SuspenseWrapper>
    </PageWithFooter>
  ), [auth.login, auth.user, notification.addNotification]);

  if (auth.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)' 
      }}>
        <LoadingFallback message="Initializing DriveConnect..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar 
          user={auth.user} 
          logout={auth.logout} 
          isAuthenticated={auth.isAuthenticated} 
          location={location} 
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PageWithFooter><Home user={auth.user} /></PageWithFooter>} />
            
            <Route path="/driver/register" element={createPublicRoute(DriverRegister)} />
            <Route path="/driver/login" element={createPublicRoute(DriverLogin)} />
            <Route path="/driver/dashboard" element={createProtectedRoute(DriverDashboard, ['driver'], '/driver/login')} />
            <Route path="/driver/profile" element={createProtectedRoute(DriverProfile, ['driver'], '/driver/login')} />
            <Route path="/driver/bookings" element={createProtectedRoute(DriverBookings, ['driver'], '/driver/login')} />
            
            <Route path="/user/register" element={createPublicRoute(UserRegister)} />
            <Route path="/user/login" element={createPublicRoute(UserLogin)} />
            <Route path="/user/dashboard" element={createProtectedRoute(UserDashboard, ['user'], '/user/dashboard')} />
            <Route path="/user/search-drivers" element={createProtectedRoute(SearchDrivers, ['user'], '/user/login')} />
            <Route path="/user/book-driver/:driverId" element={createProtectedRoute(BookingForm, ['user'], '/user/login')} />
            <Route path="/user/bookings" element={createProtectedRoute(UserBookings, ['user'], '/user/login')} />
            
            <Route path="/admin/login" element={createPublicRoute(AdminLogin)} />
            <Route path="/admin/dashboard" element={createProtectedRoute(AdminDashboard, ['admin'], '/admin/login')} />
            <Route path="/admin/drivers" element={createProtectedRoute(AdminDrivers, ['admin'], '/admin/login')} />
            <Route path="/admin/users" element={createProtectedRoute(AdminUsers, ['admin'], '/admin/login')} />
            <Route path="/admin/bookings" element={createProtectedRoute(AdminBookings, ['admin'], '/admin/login')} />
            
            <Route path="*" element={
              <PageWithFooter>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '80vh', 
                  color: 'white', 
                  textAlign: 'center' 
                }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <button onClick={() => window.location.href = '/'} style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}>
                    Go Home
                  </button>
                </div>
              </PageWithFooter>
            } />
          </Routes>
        </main>
        
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 9999, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          {notification.notifications.map((notif) => (
            <Notification 
              key={notif.id} 
              message={notif.message} 
              type={notif.type} 
              onClose={() => notification.removeNotification(notif.id)} 
              duration={notif.duration} 
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}