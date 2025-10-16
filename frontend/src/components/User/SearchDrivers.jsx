import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./SearchDrivers.css";

function SearchDrivers({ user, showNotification }) {
  const [searchLocation, setSearchLocation] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch drivers from backend
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/user/drivers'); 
      setDrivers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching drivers:", error);
      showNotification('Failed to load drivers', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle booking a driver
  const handleBookDriver = async (driver) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Please log in before booking a driver", "error");
        return;
      }

      const driverId = parseInt(driver.id || driver._id);
      if (isNaN(driverId)) {
        showNotification("Invalid driver selected", "error");
        return;
      }

      // Prepare ISO date strings
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const bookingData = {
        driverId,
        pickupLocation: searchLocation || "Not specified",
        dropLocation: "Unknown Drop",
        tripStart: now.toISOString(),
        tripEnd: oneHourLater.toISOString(),
        amount: parseInt(driver.price) || 200,
        specialRequests: "",
      };

      // Send POST request with token
      const res = await axios.post(
        "http://localhost:5000/api/bookings",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.booking) {
        showNotification(`✅ Successfully booked ${driver.name}`, "success");
        // Refresh drivers to reflect availability
        fetchDrivers();
      } else {
        showNotification(res.data?.message || "Booking failed", "error");
      }
    } catch (error) {
      console.error("❌ Error creating booking:", error.response || error);
      const message = error.response?.data?.message || "Booking failed";
      showNotification(message, "error");
    }
  };

  // Filter drivers by search location
  const filteredDrivers = drivers.filter(driver =>
    driver.location?.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="search-drivers">
      <h1>Search Drivers</h1>
      <p>Hello {user?.username || "User"}! Find available drivers near you.</p>

      <div className="search-form">
        <input
          type="text"
          placeholder="Enter your city location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <button onClick={fetchDrivers}>Search</button>
      </div>

      <div className="drivers-list">
        <h3>Available Drivers</h3>
        {loading ? (
          <p>Loading drivers...</p>
        ) : filteredDrivers.length === 0 ? (
          <p>No drivers found.</p>
        ) : (
          filteredDrivers.map(driver => (
            <div key={driver.id || driver._id} className="driver-card">
              <h4>{driver.name}</h4>
              <p>Location: {driver.location}</p>
              <p>Rating: {driver.rating ?? 0} ⭐</p>
              <p>Price: ₹{driver.price ?? 200}</p>
              <button onClick={() => handleBookDriver(driver)}>
                Book Now
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchDrivers;
