import React from 'react';
import "./UserBookings.css";
function UserBookings({ user, showNotification }) {
  const bookings = [
    {
      id: 1,
      driver: 'Ganesh',
      pickup: ' Chennai Downtown Mall',
      drop: ' Chennai Airport',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'Confirmed'
    },
    {
      id: 2,
      driver: 'Sasisivaprakash M',
      pickup: 'Trichy',
      drop: 'Kovilpatti',
      date: '2024-01-16',
      time: '8:30 AM',
      status: 'Pending'
    },
    {
      id: 3,
      driver: 'Subash',
      pickup: 'Thoothukudi',
      drop: 'Chennai',
      date: '2024-01-14',
      time: '6:00 PM',
      status: 'Completed'
    }
  ];

  return (
    <div className="user-bookings">
      <h1>My Bookings</h1>
      <p>Hello {user?.name}! Here are your booking details.</p>
      
      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <h3>Booking #{booking.id}</h3>
            <p><strong>Driver:</strong> {booking.driver}</p>
            <p><strong>From:</strong> {booking.pickup}</p>
            <p><strong>To:</strong> {booking.drop}</p>
            <p><strong>Date:</strong> {booking.date}</p>
            <p><strong>Time:</strong> {booking.time}</p>
            <p><strong>Status:</strong> 
              <span className={`status-${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </p>
            <button onClick={() => showNotification('Booking details viewed', 'info')}>
              View Details
            </button>
            {booking.status === 'Confirmed' && (
              <button onClick={() => showNotification('Booking cancelled', 'warning')}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserBookings;