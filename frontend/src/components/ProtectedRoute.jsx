import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// This component checks if a user is logged in.
// If they are, it renders the child route (using <Outlet />).
// If not, it redirects them to the login page.
export default function ProtectedRoute({ role }) {
  const { token, userRole } = useAuth();

  if (!token) {
    // User not logged in, redirect to login page
    return <Navigate to="/parent-login" replace />;
  }

  // If a specific role is required, check if the user has that role
  if (role && userRole !== role) {
    // User does not have the required role, redirect to home or a 'not authorized' page
    alert('You are not authorized to view this page.');
    return <Navigate to="/" replace />;
  }

  // User is authenticated (and has the right role if specified), so render the requested page
  return <Outlet />;
}