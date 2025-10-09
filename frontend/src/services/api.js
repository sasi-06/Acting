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
  // Authentication
  login: (credentials) => api.post('/driver/login', credentials),
  register: (driverData) => api.post('/driver/register', driverData),

  // Profile
  getProfile: () => api.get('/driver/profile'),
  updateProfile: (profileData) => api.put('/driver/profile', profileData),

  // Bookings (match backend: /bookings/driver)
  getBookings: () => api.get('/bookings/driver'),
  acceptBooking: (bookingId) => api.put(`/bookings/driver/${bookingId}/accept`),
  rejectBooking: (bookingId) => api.put(`/bookings/driver/${bookingId}/reject`),

  // Availability
  updateAvailability: (availability) => api.put('/driver/availability', { availability }),
};

// ================= USER API =================
export const userAPI = {
  // Authentication
  login: (credentials) => api.post('/user/login', credentials),
  register: (userData) => api.post('/user/register', userData),

  // Profile
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),

  // Dashboard (make sure you implement these in backend)
  getDashboard: () => api.get('/user/dashboard'),
  getRecentBookings: () => api.get('/user/recent-bookings'),
  getRecommendedDrivers: () => api.get('/user/recommended-drivers'),

  // Bookings (match backend: /bookings)
  getBookings: () => api.get('/user/bookings'), // you should add this route in backend
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),

  // Driver search
  searchDrivers: (searchParams) => api.get('/user/drivers/search', { params: searchParams }),
};

// ================= ADMIN API =================
export const adminAPI = {
  // Authentication
  login: (credentials) => api.post('/admin/login', credentials),

  // Dashboard
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: () => api.get('/admin/users'),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),

  // Drivers
  getDrivers: () => api.get('/admin/drivers'),
  updateDriver: (driverId, driverData) => api.put(`/admin/drivers/${driverId}`, driverData),

  // Bookings (match backend: /bookings/admin/all)
  getBookings: () => api.get('/bookings/admin/all'),
  updateBooking: (bookingId, action) => api.put(`/bookings/admin/${bookingId}/${action}`),
};

export const registerUser = (data) =>
  axios.post('http://127.0.0.1:5001/api/users/register', data);

export default api;
