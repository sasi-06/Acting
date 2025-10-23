import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect based on URL
      if (error.config.url.startsWith('/driver')) {
        window.location.href = '/driver/login';
      } else if (error.config.url.startsWith('/user')) {
        window.location.href = '/user/login';
      } else if (error.config.url.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/user/login';
      }
    }
    return Promise.reject(error);
  }
);

// ================= DRIVER API =================
export const driverAPI = {
  login: (credentials) => api.post('/driver/login', credentials),
  register: (driverData) => api.post('/driver/register', driverData),

  getProfile: () => api.get('/driver/profile'),
  updateProfile: (profileData) => api.put('/driver/profile', profileData),

  getBookings: () => api.get('/bookings/driver'),
  acceptBooking: (bookingId) => api.put(`/bookings/driver/${bookingId}/accept`),
  rejectBooking: (bookingId) => api.put(`/bookings/driver/${bookingId}/reject`),

  updateAvailability: (availability) => api.put('/driver/availability', { availability }),
};

// ================= USER API =================
export const userAPI = {
  login: (credentials) => api.post('/user/login', credentials),
  register: (userData) => api.post('/user/register', userData),

  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),

  getDashboard: () => api.get('/user/dashboard'),
  getRecentBookings: () => api.get('/user/recent-bookings'),
  getRecommendedDrivers: () => api.get('/user/recommended-drivers'),

  getBookings: () => api.get('/user/bookings'),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),

  // ================= FIXED Quick Booking =================
  createQuickBooking: (bookingData) => {
    // Use frontend date if available, otherwise default to now
    const tripStart = bookingData.tripStart || new Date();
    // Default trip end: +2 hours after start
    const tripEnd = bookingData.tripEnd || new Date(new Date(tripStart).getTime() + 2 * 60 * 60 * 1000);

    const formattedData = {
      pickupLocation: bookingData.pickupLocation || 'Not specified',
      dropLocation: bookingData.dropLocation || 'Not specified',
      tripStartDateTime: tripStart,
      tripEndDateTime: tripEnd,
      vehicleType: bookingData.vehicleType || 'Car',
    };

    return api.post('/user/quick-booking', formattedData);
  },

  searchDrivers: (searchParams) => api.get('/user/drivers/search', { params: searchParams }),
};

// ================= ADMIN API =================
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStats: () => api.get('/admin/stats'),

  getUsers: () => api.get('/admin/users'),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),

  getDrivers: () => api.get('/admin/drivers'),
  updateDriver: (driverId, driverData) => api.put(`/admin/drivers/${driverId}`, driverData),

  getBookings: () => api.get('/bookings/admin/all'),
  updateBooking: (bookingId, action) => api.put(`/bookings/admin/${bookingId}/${action}`),
};

// Separate registerUser export
export const registerUser = (data) =>
  axios.post('http://127.0.0.1:5001/api/user/register', data);

export default api;
