const { getAuth } = require('../config/firebase');
const logger = require('../logger');

/**
 * Assign a role to a user using Firebase Custom Claims
 * @param {string} uid - Firebase user ID
 * @param {string} role - Role to assign (parent, staff, admin, superadmin)
 * @returns {Promise} Promise resolving to success/failure
 */
const assignRole = async (uid, role) => {
  try {
    // Validate role
    const validRoles = ['parent', 'staff', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
    }

    const auth = getAuth();
    
    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, { role });
    
    // Revoke existing tokens to force refresh and get new claims
    await auth.revokeRefreshTokens(uid);
    
    logger.info(`Role '${role}' assigned to user ${uid}`);
    return { success: true, message: `Role '${role}' assigned successfully` };
  } catch (error) {
    logger.error(`Failed to assign role '${role}' to user ${uid}: ${error.message}`);
    throw error;
  }
};

/**
 * Get user's custom claims
 * @param {string} uid - Firebase user ID
 * @returns {Promise} Promise resolving to user's custom claims
 */
const getUserClaims = async (uid) => {
  try {
    const auth = getAuth();
    const user = await auth.getUser(uid);
    return user.customClaims || {};
  } catch (error) {
    logger.error(`Failed to get claims for user ${uid}: ${error.message}`);
    throw error;
  }
};

/**
 * Remove all custom claims from a user
 * @param {string} uid - Firebase user ID
 * @returns {Promise} Promise resolving to success/failure
 */
const removeUserClaims = async (uid) => {
  try {
    const auth = getAuth();
    await auth.setCustomUserClaims(uid, null);
    await auth.revokeRefreshTokens(uid);
    
    logger.info(`Custom claims removed from user ${uid}`);
    return { success: true, message: 'Custom claims removed successfully' };
  } catch (error) {
    logger.error(`Failed to remove claims from user ${uid}: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new Firebase user with role
 * @param {Object} userData - User data including email, password, role
 * @returns {Promise} Promise resolving to created user
 */
const createUserWithRole = async (userData) => {
  try {
    const { email, password, role = 'parent', displayName } = userData;
    
    const auth = getAuth();
    
    // Create the user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });
    
    // Assign role via custom claims
    await assignRole(userRecord.uid, role);
    
    logger.info(`User created with UID: ${userRecord.uid}, email: ${email}, role: ${role}`);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      role,
      displayName: userRecord.displayName,
    };
  } catch (error) {
    logger.error(`Failed to create user with role: ${error.message}`);
    throw error;
  }
};

/**
 * Update user role (for admin operations)
 * @param {string} targetUid - UID of user whose role is being changed
 * @param {string} newRole - New role to assign
 * @param {Object} adminUser - Admin user making the change
 * @returns {Promise} Promise resolving to success/failure
 */
const updateUserRole = async (targetUid, newRole, adminUser) => {
  try {
    // Validate admin permissions
    if (!adminUser || !['admin', 'superadmin'].includes(adminUser.role)) {
      throw new Error('Insufficient permissions to update user roles');
    }
    
    // Prevent non-superadmin from creating superadmin
    if (newRole === 'superadmin' && adminUser.role !== 'superadmin') {
      throw new Error('Only superadmins can assign superadmin role');
    }
    
    await assignRole(targetUid, newRole);
    
    logger.info(`Admin ${adminUser.uid} updated role for user ${targetUid} to ${newRole}`);
    return { success: true, message: `User role updated to ${newRole}` };
  } catch (error) {
    logger.error(`Failed to update user role: ${error.message}`);
    throw error;
  }
};

module.exports = {
  assignRole,
  getUserClaims,
  removeUserClaims,
  createUserWithRole,
  updateUserRole,
};