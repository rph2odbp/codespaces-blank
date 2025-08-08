const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Optional: Use a logger for debugging

const authMiddleware = (req, res, next) => {
  try {
    // Log the request URL and method for debugging
    logger && logger.info(`Auth check for ${req.method} ${req.url}`);
    
    // 1. Check for the Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      logger && logger.warn(`Authorization header missing for ${req.method} ${req.url} from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Authorization token is required.' });
    }

    // 2. Ensure the token has the "Bearer" prefix
    if (!authHeader.startsWith('Bearer ')) {
      logger && logger.warn(`Invalid token format for ${req.method} ${req.url}. Expected "Bearer <token>".`);
      return res.status(401).json({ error: 'Invalid token format.' });
    }

    // Log incoming headers for debugging (excluding sensitive data)
    const headersCopy = { ...req.headers };
    if (headersCopy.authorization) {
      headersCopy.authorization = `Bearer ${headersCopy.authorization.split(' ')[1] ? '[TOKEN_PRESENT]' : '[NO_TOKEN]'}`;
    }
    logger && logger.info(`Headers for ${req.method} ${req.url}: ${JSON.stringify(headersCopy)}`);

    const token = authHeader.split(' ')[1];

    // 4. Verify the token using the secret from your .env file
    if (!process.env.JWT_SECRET) {
      logger && logger.error('JWT_SECRET is not defined in the environment variables.');
      return res.status(500).json({ error: 'Internal server error.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded user payload (which contains userId and role) to the request object
    req.user = decoded.user;

    logger && logger.info(`User authenticated for ${req.method} ${req.url}: ${JSON.stringify(req.user)}`);

    // 6. Pass control to the next middleware or route handler
    next();
  } catch (err) {
    // Log the error for debugging purposes
    logger && logger.error(`Token verification failed for ${req.method} ${req.url}: ${err.message}`);

    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
    }

    // Generic error response
    res.status(401).json({ error: 'Authorization failed.' });
  }
};

module.exports = authMiddleware;