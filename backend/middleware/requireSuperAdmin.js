const requireAuth = require('./requireAuth');
const logger = require('../logger'); // Optional: Use a logger for debugging

const requireSuperAdmin = (req, res, next) => {
  // First, ensure the user is authenticated
  requireAuth(req, res, () => {
    // Define the required role (can be configured via environment variables if needed)
    const requiredRole = 'superadmin';

    // Check if the user is authenticated and has the required role
    if (req.user && req.user.role === requiredRole) {
      // User has the correct role, proceed to the next middleware or route handler
      next();
    } else {
      // Log unauthorized access attempts for debugging/auditing
      logger && logger.warn(`Unauthorized access attempt by user: ${req.user ? req.user.id : 'Unknown'}`);

      // User does not have the correct role
      res.status(403).json({ error: 'Forbidden. Super administrator access required.' });
    }
  });
};

module.exports = requireSuperAdmin;