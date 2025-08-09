const logger = require('../logger');

/**
 * Create role-based access control middleware for Firebase users
 * @param {string|Array} allowedRoles - Single role or array of roles allowed
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (firebaseAuth middleware should run first)
      if (!req.user) {
        logger.warn('Role check failed: No user found in request');
        return res.status(401).json({ error: 'Authentication required.' });
      }

      // Convert single role to array for consistency
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user has any of the required roles
      const userRole = req.user.role || 'parent'; // Default to 'parent' if no role set
      
      if (!roles.includes(userRole)) {
        logger.warn(`Access denied for user ${req.user.uid} with role ${userRole}. Required roles: ${roles.join(', ')}`);
        return res.status(403).json({ 
          error: `Access denied. Required role(s): ${roles.join(', ')}.` 
        });
      }

      logger.info(`Access granted for user ${req.user.uid} with role ${userRole}`);
      next();
    } catch (error) {
      logger.error(`Role validation error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error during role validation.' });
    }
  };
};

// Predefined role middleware functions
const requireParent = requireRole('parent');
const requireStaff = requireRole(['staff', 'admin', 'superadmin']);
const requireAdmin = requireRole(['admin', 'superadmin']);
const requireSuperAdmin = requireRole('superadmin');

module.exports = {
  requireRole,
  requireParent,
  requireStaff,
  requireAdmin,
  requireSuperAdmin,
};