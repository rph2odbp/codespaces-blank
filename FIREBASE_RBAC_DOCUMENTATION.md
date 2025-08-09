# Firebase RBAC and Authentication Implementation

This document describes the Firebase Role-Based Access Control (RBAC) and Authentication system implemented for the camp registration application.

## Overview

The implementation provides a robust authentication and authorization system using Firebase Authentication with Custom Claims for role management, alongside Firebase Realtime Database with security rules.

## Features Implemented

### 1. Firebase Admin SDK Initialization
- **Location**: `backend/config/firebase.js`
- **Purpose**: Securely connects the backend to Firebase using the Admin SDK
- **Configuration**: Supports both service account keys and default credentials
- **Environment Variables**:
  - `FIREBASE_PROJECT_ID`: Firebase project identifier
  - `FIREBASE_DATABASE_URL`: Realtime Database URL
  - `FIREBASE_SERVICE_ACCOUNT_KEY`: JSON service account key (production)

### 2. Authentication Middleware
- **Firebase Token Validation**: `backend/middleware/firebaseAuth.js`
  - Validates Firebase ID tokens from client requests
  - Extracts user information and custom claims
  - Handles token expiration and refresh
- **Role-based Middleware**: `backend/middleware/firebaseRoles.js`
  - Enforces role-based access control
  - Supports hierarchical role checking
  - Predefined middleware for common roles

### 3. Role Management System
- **Custom Claims**: `backend/utils/firebaseRoles.js`
  - Assign roles using Firebase Custom Claims
  - Support for parent, staff, admin, superadmin roles
  - Token revocation for immediate role updates
  - Role validation and permissions checking

### 4. API Endpoints
- **Registration**: `POST /api/firebase-auth/register`
  - Creates Firebase user and MongoDB record
  - Assigns default 'parent' role
- **Role Assignment**: `POST /api/firebase-auth/assign-role`
  - Admin/SuperAdmin only endpoint
  - Updates user roles via custom claims
- **Profile Management**: `GET /api/firebase-auth/profile`
  - Retrieves combined Firebase and MongoDB user data
- **Token Verification**: `POST /api/firebase-auth/verify-token`
  - Validates client-side tokens

### 5. Database Security Rules
- **Location**: `database.rules.json`
- **Features**:
  - Role-based read/write permissions
  - Hierarchical access control
  - Data isolation by user role
  - Special permissions for admin operations

### 6. Frontend Integration
- **Firebase Configuration**: `frontend/src/config/firebase.js`
- **Auth Context**: `frontend/src/contexts/FirebaseAuthContext.jsx`
  - React context for Firebase authentication
  - Automatic token management
  - Custom claims fetching
- **API Utilities**: `frontend/src/utils/firebaseApi.js`
  - Authenticated API calls
  - Role checking utilities
  - Token refresh handling

### 7. Cloud Functions
- **Location**: `functions/index.js`
- **Functions**:
  - `assignRole`: Server-side role assignment
  - `onUserCreate`: Auto-assign default roles
  - `getUserClaims`: Retrieve user claims
  - `revokeTokens`: Force token refresh

## Role Hierarchy

1. **Parent** (Level 1): Default role, basic access
2. **Staff** (Level 2): Can manage sessions and campers
3. **Admin** (Level 3): Can manage users and assign staff roles
4. **SuperAdmin** (Level 4): Full system access, can assign admin roles

## Security Features

### Authentication
- Firebase ID token validation
- Automatic token refresh
- Secure logout with token revocation

### Authorization
- Custom claims for role storage
- Hierarchical permission checking
- Database-level security rules
- API endpoint protection

### Data Protection
- Role-based data access
- User data isolation
- Admin audit logging
- Secure role assignment

## API Usage Examples

### User Registration
```javascript
POST /api/firebase-auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Role Assignment (Admin only)
```javascript
POST /api/firebase-auth/assign-role
Authorization: Bearer <firebase-id-token>
{
  "targetUid": "firebase-user-uid",
  "role": "staff"
}
```

### Get User Profile
```javascript
GET /api/firebase-auth/profile
Authorization: Bearer <firebase-id-token>
```

## Frontend Usage

### Authentication
```jsx
import { useFirebaseAuth } from './contexts/FirebaseAuthContext';

function LoginComponent() {
  const { login, user, claims } = useFirebaseAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      console.log('User role:', claims.role);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Role-based UI Rendering
```jsx
import { hasMinimumRole } from './utils/firebaseApi';

function AdminPanel() {
  const { claims } = useFirebaseAuth();
  
  if (!hasMinimumRole(claims, 'admin')) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Content</div>;
}
```

## Testing and Development

### Firebase Emulators
The project is configured to work with Firebase Emulators for local development:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# Access Emulator UI
# http://localhost:4000
```

### Environment Configuration
Update the following files for your Firebase project:
- `backend/.env`: Backend Firebase configuration
- `frontend/.env`: Frontend Firebase configuration
- `firebase.json`: Firebase project settings

### Test Script
Run the backend test script to validate the implementation:
```bash
cd backend
node test-firebase-rbac.js
```

## Database Rules Testing

Use the Firebase Console Rules Playground to test security rules:
1. Navigate to Firebase Console → Realtime Database → Rules
2. Use the Rules Playground to simulate different user roles
3. Test read/write operations with different authentication states

## Production Deployment

### Backend
1. Set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
2. Update `FIREBASE_PROJECT_ID` and `FIREBASE_DATABASE_URL`
3. Deploy to your hosting platform

### Frontend
1. Update environment variables in `.env`
2. Build the application: `npm run build`
3. Deploy to Firebase Hosting or your preferred platform

### Cloud Functions
1. Install Firebase CLI
2. Deploy functions: `firebase deploy --only functions`
3. Configure CORS for web access

## Security Considerations

### Production Security
- Use service account keys for backend authentication
- Implement rate limiting on authentication endpoints
- Enable Firebase Security Rules
- Monitor authentication logs
- Implement proper CORS policies

### Token Management
- Tokens automatically refresh client-side
- Server-side token validation on every request
- Role changes trigger token revocation
- Secure token storage in client applications

## Troubleshooting

### Common Issues
1. **Token Expired**: Automatic refresh should handle this
2. **Permission Denied**: Check user roles and database rules
3. **Firebase Not Initialized**: Verify environment variables
4. **CORS Errors**: Check Firebase hosting configuration

### Debug Logging
The implementation includes comprehensive logging:
- Backend: Uses Winston logger
- Frontend: Console logging for development
- Cloud Functions: Firebase Functions logs

## Next Steps

1. **Testing**: Use Firebase Emulators for comprehensive testing
2. **Monitoring**: Set up Firebase Analytics and Performance monitoring
3. **Scaling**: Consider Firebase Functions for heavy operations
4. **Security**: Regular security audits and rule reviews