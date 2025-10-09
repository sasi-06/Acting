import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🚗 Acting Driver</h3>
            <p>Professional acting drivers for your joureny across Tamil Nadu.</p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📺</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>For Customers</h3>
            <ul className="footer-links">
              <li><Link to="/user/register">Register</Link></li>
              <li><Link to="/user/login">Login</Link></li>
              <li><Link to="/user/search-drivers">Find Drivers</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>For Drivers</h3>
            <ul className="footer-links">
              <li><Link to="/driver/register">Join as Driver</Link></li>
              <li><Link to="/driver/login">Driver Login</Link></li>
              <li><a href="#requirements">Requirements</a></li>
              <li><a href="#earnings">Earnings</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Acting Driver Booking System. All rights reserved.</p>
            <p>Made for the user who belive us</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;