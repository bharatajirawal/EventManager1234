const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const AuthRouter = require('./Routes/AuthRouter');
const userRoutes = require('./Routes/events');

// Load environment variables - MUST BE AT THE VERY TOP
require('dotenv').config();

// Debugging - check if env vars are loaded
console.log('Environment Variables:', {
  PORT: process.env.PORT,
  CLOUD_NAME: process.env.CLOUD_NAME ? 'exists' : 'missing',
  CLOUD_API_KEY: process.env.CLOUD_API_KEY ? 'exists' : 'missing'
});

// Connect to database
require('./Models/db');

const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Express.js CORS configuration

// Set up CORS middleware with specific origin
app.use(cors({
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true,                // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Simple health check route
app.get('/ping', (req, res) => {
  res.send('PONG');
});

// API Routes
app.use('/auth', AuthRouter);
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});