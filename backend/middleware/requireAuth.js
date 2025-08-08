const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../logger'); // Optional: Use a logger for debugging

const requireAuth = async (req, res, next) => {
  try {
    // 1. Check for the authorization header
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      logger && logger.warn('Authorization header missing or invalid format.');
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    // 2. Extract the token from the "Bearer <token>" format
    const token = authorization.split(' ')[1];

    // 3. Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in the database to ensure they still exist
    req.user = await User.findById(decoded.userId).select('_id email role').lean();

    if (!req.user) {
      logger && logger.warn(`User not found for ID: ${decoded.userId}`);
      return res.status(401).json({ error: 'Request is not authorized.' });
    }

    // 5. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    logger && logger.error(`Authorization error: ${error.message}`);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }

    // Generic error response for other JWT issues
    res.status(401).json({ error: 'Request is not authorized.' });
  }
};

module.exports = requireAuth;