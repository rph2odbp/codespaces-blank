const { getAuth } = require('../config/firebase');
const logger = require('../logger');

/**
 * Middleware to validate Firebase ID tokens
 * This replaces JWT token validation with Firebase token validation
 */
const firebaseAuth = async (req, res, next) => {
  try {
    // Log the request for debugging
    logger.info(`Firebase auth check for ${req.method} ${req.url}`);
    
    // 1. Check for the Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      logger.warn(`Authorization header missing for ${req.method} ${req.url} from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Authorization token is required.' });
    }

    // 2. Ensure the token has the "Bearer" prefix
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn(`Invalid token format for ${req.method} ${req.url}. Expected "Bearer <token>".`);
      return res.status(401).json({ error: 'Invalid token format.' });
    }

    const idToken = authHeader.split(' ')[1];

    // 3. Verify the Firebase ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    // 4. Attach the decoded user information to the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'parent', // Default role from custom claims
      claims: decodedToken,
    };

    logger.info(`User authenticated for ${req.method} ${req.url}: ${JSON.stringify({
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    })}`);

    // 5. Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error for debugging purposes
    logger.error(`Firebase token verification failed for ${req.method} ${req.url}: ${error.message}`);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    } else if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
    } else if (error.code === 'auth/project-not-found') {
      return res.status(500).json({ error: 'Firebase project configuration error.' });
    }

    // Generic error response
    res.status(401).json({ error: 'Authorization failed.' });
  }
};

module.exports = firebaseAuth;