# Driver Booking Management System - Backend

A Node.js/Express backend API for managing driver bookings with JWT authentication and MongoDB integration.

## Features

- **Driver Authentication**: JWT-based authentication for drivers
- **Booking Management**: Fetch, accept, and reject bookings
- **MongoDB Integration**: Document-based storage for drivers and bookings
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt for password hashing
- **Validation**: Built-in Express validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/driver-booking
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud) and update MONGODB_URI accordingly
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
All driver routes require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Driver Routes
- **GET /api/driver/bookings** - Fetch driver's bookings
- **PUT /api/driver/bookings/:id/accept** - Accept a booking
- **PUT /api/driver/bookings/:id/reject** - Reject a booking

## Project Structure

```
backend/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── Booking.js           # Booking schema/model
│   └── Driver.js            # Driver schema/model
├── routes/
│   └── driverRoutes.js      # Driver-related API routes
├── server.js                # Main application entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Database Models

### Driver Model
```javascript
{
  name: String,
  email: String,
  phone: String,
  password: String, // Hashed
  vehicleType: String,
  licenseNumber: String,
  createdAt: Date
}
```

### Booking Model
```javascript
{
  customerName: String,
  customerPhone: String,
  pickupLocation: String,
  dropLocation: String,
  tripStartDateTime: Date,
  tripEndDateTime: Date,
  vehicleType: String,
  carCompany: String,
  numberOfPersons: Number,
  carNumber: String,
  amount: Number,
  status: String, // 'Pending', 'Confirmed', 'Rejected', 'Completed'
  driverId: ObjectId, // Reference to Driver
  specialRequests: String,
  createdAt: Date
}
```

## Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication with expiration
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for cross-origin requests

## Error Handling

The API returns standardized error responses:
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Testing the API

You can test the endpoints using tools like Postman or curl:

```bash
# Example: Get driver bookings
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/driver/bookings

# Example: Accept a booking
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/driver/bookings/BOOKING_ID/accept
```

## Deployment

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/driver-booking
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

### Using PM2 for Production
```bash
npm install -g pm2
pm2 start server.js --name "driver-booking-api"
pm2 startup
pm2 save
```

### Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t driver-booking-api .
docker run -p 5000:5000 driver-booking-api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
