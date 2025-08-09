import { auth } from '../config/firebase';
import { getIdToken } from 'firebase/auth';

/**
 * Make an authenticated API call using Firebase ID token
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  try {
    // Get the current user's ID token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await getIdToken(user);
    
    // Merge headers with authorization
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      ...options.headers,
    };

    // Make the API call
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      // Try to get a fresh token
      const freshToken = await getIdToken(user, true);
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${freshToken}`,
        },
      });
      
      if (retryResponse.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      return retryResponse;
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
};

/**
 * Assign role to a user (Admin/SuperAdmin only)
 * @param {string} targetUid - UID of user to assign role to
 * @param {string} role - Role to assign
 * @returns {Promise} - Assignment result
 */
export const assignUserRole = async (targetUid, role) => {
  try {
    const response = await authenticatedFetch('/api/firebase-auth/assign-role', {
      method: 'POST',
      body: JSON.stringify({ targetUid, role }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to assign role');
    }

    return data;
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
};

/**
 * Get user's custom claims
 * @param {string} uid - User UID
 * @returns {Promise} - User claims
 */
export const getUserClaims = async (uid) => {
  try {
    const response = await authenticatedFetch(`/api/firebase-auth/claims/${uid}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user claims');
    }

    return data.claims;
  } catch (error) {
    console.error('Error getting user claims:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await authenticatedFetch('/api/firebase-auth/profile');
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user profile');
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Check if user has required role
 * @param {Object} userClaims - User's custom claims
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {boolean} - Whether user has required role
 */
export const hasRole = (userClaims, requiredRoles) => {
  if (!userClaims || !userClaims.role) {
    return false;
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userClaims.role);
};

/**
 * Role hierarchy check - higher roles include lower role permissions
 * @param {Object} userClaims - User's custom claims
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean} - Whether user meets minimum role requirement
 */
export const hasMinimumRole = (userClaims, minimumRole) => {
  if (!userClaims || !userClaims.role) {
    return false;
  }

  const roleHierarchy = {
    'parent': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 4,
  };

  const userRoleLevel = roleHierarchy[userClaims.role] || 0;
  const requiredRoleLevel = roleHierarchy[minimumRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
};