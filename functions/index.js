const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Cloud Function to assign roles to users
 * Only accessible by admin/superadmin users
 */
exports.assignRole = onRequest(async (req, res) => {
  try {
    // Verify the request method
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method not allowed"});
    }

    // Verify the ID token
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({error: "Unauthorized"});
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if the user has admin or superadmin role
    const userRole = decodedToken.role;
    if (!userRole || !["admin", "superadmin"].includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden: Admin or SuperAdmin role required",
      });
    }

    const {targetUid, role} = req.body;

    // Validate inputs
    if (!targetUid || !role) {
      return res.status(400).json({
        error: "targetUid and role are required",
      });
    }

    const validRoles = ["parent", "staff", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Prevent non-superadmin from creating superadmin
    if (role === "superadmin" && userRole !== "superadmin") {
      return res.status(403).json({
        error: "Only superadmins can assign superadmin role",
      });
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(targetUid, {role});

    // Revoke existing tokens to force refresh
    await admin.auth().revokeRefreshTokens(targetUid);

    return res.status(200).json({
      success: true,
      message: `Role '${role}' assigned to user ${targetUid}`,
    });
  } catch (error) {
    console.error("Error in assignRole function:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * Cloud Function to automatically assign default role to new users
 */
exports.onUserCreate = onDocumentCreated("users/{userId}", (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const userData = snapshot.data();
  const userId = event.params.userId;

  // Assign default 'parent' role to new users
  return admin.auth().setCustomUserClaims(userId, {
    role: userData.role || "parent",
  }).then(() => {
    console.log(`Default role assigned to user: ${userId}`);
  }).catch((error) => {
    console.error("Error assigning default role:", error);
  });
});

/**
 * Cloud Function to get user claims
 */
exports.getUserClaims = onRequest(async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({error: "Method not allowed"});
    }

    // Verify the ID token
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({error: "Unauthorized"});
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const {uid} = req.query;

    // Users can only get their own claims unless they're admin/superadmin
    if (uid !== decodedToken.uid &&
        !["admin", "superadmin"].includes(decodedToken.role)) {
      return res.status(403).json({error: "Access denied"});
    }

    const user = await admin.auth().getUser(uid || decodedToken.uid);
    const claims = user.customClaims || {};

    return res.status(200).json({claims});
  } catch (error) {
    console.error("Error in getUserClaims function:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * Cloud Function to revoke user tokens (for immediate role updates)
 */
exports.revokeTokens = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method not allowed"});
    }

    // Verify the ID token
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({error: "Unauthorized"});
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if the user has admin or superadmin role
    const userRole = decodedToken.role;
    if (!userRole || !["admin", "superadmin"].includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden: Admin or SuperAdmin role required",
      });
    }

    const {targetUid} = req.body;

    if (!targetUid) {
      return res.status(400).json({error: "targetUid is required"});
    }

    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(targetUid);

    return res.status(200).json({
      success: true,
      message: `Tokens revoked for user ${targetUid}`,
    });
  } catch (error) {
    console.error("Error in revokeTokens function:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});