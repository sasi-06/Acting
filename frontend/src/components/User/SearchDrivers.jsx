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
      const res = await axios.get('http://localhost:5000/api/user/drivers'); // no auth needed
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

  // 🔹 Handle booking a driver
  const handleBookDriver = async (driver) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Please log in before booking a driver", "error");
        return;
      }

      const bookingData = {
        driverId: driver._id || driver.id,
        pickupLocation: searchLocation || "Not specified",
        dropLocation: "Unknown Drop", // You can later add fields for this
        tripStart: new Date().toISOString(),
        tripEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1 hour
        amount: driver.price || 200,
        specialRequests: "",
      };

      const res = await axios.post(
        "http://localhost:5000/api/booking",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data) {
        showNotification(`✅ Successfully booked ${driver.name}`, "success");
        // Optional: Refresh driver list to mark driver unavailable
        fetchDrivers();
      }
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      showNotification("Booking failed", "error");
    }
  };

  // Filter drivers by search location
  const filteredDrivers = drivers.filter(driver =>
    driver.location.toLowerCase().includes(searchLocation.toLowerCase())
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
              <p>Rating: {driver.rating} ⭐</p>
              <p>Price: ₹{driver.price}</p>
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
