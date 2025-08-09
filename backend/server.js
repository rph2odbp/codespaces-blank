const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const errorHandler = require('./middleware/errorHandler'); // Global error handler
const logger = require('./logger'); // Logger for structured logging
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // Security headers
const compression = require('compression'); // Gzip compression
const cors = require('cors'); // Cross-Origin Resource Sharing
const { initializeFirebase } = require('./config/firebase'); // Firebase initialization

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
try {
  initializeFirebase();
  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK:', error);
  // Continue without Firebase in development mode
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Initialize Express app
const app = express();

// Enable trust proxy for rate limiting and proxies
app.set('trust proxy', 1); // Trust the first proxy (e.g., in containerized environments)

// Connect to the database
connectDB()
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => {
    logger.error(`Database connection error: ${err.message}`, { stack: err.stack });
    process.exit(1); // Exit if the database connection fails
  });

// Middleware to parse JSON requests
app.use(express.json());

// Apply security headers
app.use(helmet());

// Enable Gzip compression
app.use(compression());

// Enable CORS for all routes
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
}));

// Rate limiter for all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Middleware to log all incoming requests
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  res.on('finish', () => {
    logger.info(`Response: ${req.method} ${req.url} - Status: ${res.statusCode}`);
  });
  next();
});

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/firebase-auth', require('./routes/firebaseAuth')); // Firebase authentication routes
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/campers', require('./routes/campers'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Serve the index.html file for any route that is not an API route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Global error handler (must be the last middleware)
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Start the server
const PORT = process.env.PORT || 4000; // Default to port 4000 if not set in .env
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown for SIGTERM and SIGINT
const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing server...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    logger.error(`Server error: ${err.message}`);
    process.exit(1);
  }
});