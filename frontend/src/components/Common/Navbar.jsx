import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* ❌ Removed .container */}
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🚗 RentNGo
        </Link>
        
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`navbar-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          {!user ? (
            <>
              <li><Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              <li className="nav-dropdown">
                <span className="nav-link">Driver</span>
                <div className="dropdown-menu">
                  <Link to="/driver/login" className="dropdown-item">Login</Link>
                  <Link to="/driver/register" className="dropdown-item">Register</Link>
                </div>
              </li>
              <li className="nav-dropdown">
                <span className="nav-link">User</span>
                <div className="dropdown-menu">
                  <Link to="/user/login" className="dropdown-item">Login</Link>
                  <Link to="/user/register" className="dropdown-item">Register</Link>
                </div>
              </li>
              <li><Link to="/admin/login" className="nav-link">Admin</Link></li>
            </>
          ) : (
            <>
              {user.userType === 'driver' && (
                <>
                  <li><Link to="/driver/dashboard" className="nav-link">Dashboard</Link></li>
                  <li><Link to="/driver/profile" className="nav-link">Profile</Link></li>
                  <li><Link to="/driver/bookings" className="nav-link">Bookings</Link></li>
                </>
              )}
              
              {user.userType === 'user' && (
                <>
                  <li><Link to="/user/dashboard" className="nav-link">Dashboard</Link></li>
                  <li><Link to="/user/search-drivers" className="nav-link">Find Drivers</Link></li>
                  <li><Link to="/user/bookings" className="nav-link">My Bookings</Link></li>
                </>
              )}
              
              {user.userType === 'admin' && (
                <>
                  <li><Link to="/admin/dashboard" className="nav-link">Dashboard</Link></li>
                  <li><Link to="/admin/drivers" className="nav-link">Drivers</Link></li>
                  <li><Link to="/admin/users" className="nav-link">Users</Link></li>
                  <li><Link to="/admin/bookings" className="nav-link">Bookings</Link></li>
                </>
              )}
              
              <li className="user-menu">
                <span className="nav-link user-greeting">
                  👋 {user.name || user.username || user.driverName}
                </span>
                <button className="btn btn-danger nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

// Example in your main.jsx or wherever you create your router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';




