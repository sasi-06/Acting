import React, { useState } from 'react';
import "./BookingForm.css";

function BookingForm({ user, showNotification }) {
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropLocation: '',
    tripStart: '',
    tripEnd: ''
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔹 Capitalize first letter of each word for locations
    const formattedValue = (name === "pickupLocation" || name === "dropLocation")
      ? value.replace(/\b\w/g, char => char.toUpperCase())
      : value;

    setBookingData({
      ...bookingData,
      [name]: formattedValue
    });

    setError(""); // clear error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (bookingData.pickupLocation.toLowerCase() === bookingData.dropLocation.toLowerCase()) {
      setError("⚠ Pickup and Drop locations cannot be the same.");
      return;
    }

    if (bookingData.tripEnd <= bookingData.tripStart) {
      setError("⚠ Trip End Date & Time must be after Trip Start Date & Time.");
      return;
    }

    showNotification('✅ Booking request sent!', 'success');
  };

  const today = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

  return (
    <div className="booking-form">
      <h1>Book a Driver</h1>
      <p>Hello {user?.name}, please fill out the form below to book a driver.</p>
      
      <form onSubmit={handleSubmit}>
        {/* Pickup */}
        <div className="input-group">
          <label title="Where should the driver pick you up?">Pickup Location:</label>
          <input
            type="text"
            name="pickupLocation"
            value={bookingData.pickupLocation}
            onChange={handleChange}
            placeholder="Pickup Location: e.g., Chennai Central Station"
            required
          />
          <small className="helper-text">Enter the city/landmark where the driver should start.</small>
        </div>
        
        {/* Drop */}
        <div className="input-group">
          <label title="Where should the driver drop you?">Drop Location:</label>
          <input
            type="text"
            name="dropLocation"
            value={bookingData.dropLocation}
            onChange={handleChange}
            placeholder="Drop Location: e.g., Marina Beach"
            required
          />
          <small className="helper-text">Enter the destination of your journey.</small>
        </div>
        
        {/* Start Date */}
        <div className="input-group">
          <label title="When does your journey start?">Trip Start Date & Time:</label>
          <input
            type="datetime-local"
            name="tripStart"
            value={bookingData.tripStart}
            onChange={handleChange}
            min={today}
            required
          />
          <small className="helper-text">Select the exact date & time your trip begins.</small>
        </div>
        
        {/* End Date */}
        <div className="input-group">
          <label title="When will your journey end?">Trip End Date & Time:</label>
          <input
            type="datetime-local"
            name="tripEnd"
            value={bookingData.tripEnd}
            onChange={handleChange}
            min={bookingData.tripStart || today}
            required
          />
          <small className="helper-text">Select the exact date & time your trip ends.</small>
        </div>

        {/* Error */}
        {error && <p className="error-text">{error}</p>}
        
        <button type="submit">Book Driver</button>
      </form>
    </div>
  );
}

export default BookingForm;
