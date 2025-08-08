const requireAuth = require('./requireAuth');
const logger = require('../logger'); // Optional: Use a logger for debugging

const requireAdmin = (req, res, next) => {
  // First, ensure the user is authenticated
  requireAuth(req, res, () => {
    try {
      // Define allowed roles (can be configured via environment variables if needed)
      const allowedRoles = process.env.ALLOWED_ADMIN_ROLES
        ? process.env.ALLOWED_ADMIN_ROLES.split(',')
        : ['admin', 'superadmin'];

      // Check if the user object exists and has one of the allowed roles
      if (req.user && allowedRoles.includes(req.user.role)) {
        // User is authorized, proceed to the next middleware or route handler
        return next();
      }

      // Log unauthorized access attempts for debugging/auditing
      logger && logger.warn(`Unauthorized access attempt by user: ${req.user ? req.user.id : 'Unknown'}`);

      // User does not have the correct role
      return res.status(403).json({ error: 'Forbidden. Administrator access required.' });
    } catch (error) {
      // Log unexpected errors
      logger && logger.error(`Error in requireAdmin middleware: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  });
};

module.exports = requireAdmin;