import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Nav() {
  const { token, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '1rem', 
      borderBottom: '1px solid #ccc',
      marginBottom: '1.5rem'
    }}>
      <Link to="/">Home</Link>

      {/* Links for logged-in users */}
      {token ? (
        <>
          {userRole === 'parent' && <Link to="/parent-profile">My Profile</Link>}
          {(userRole === 'admin' || userRole === 'superadmin') && <Link to="/admin-panel">Admin Panel</Link>}
          <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</button>
        </>
      ) : (
        /* Links for logged-out users */
        <>
          <Link to="/parent-login" style={{ marginLeft: 'auto' }}>Parent Login</Link>
          <Link to="/staff-login">Staff Login</Link>
        </>
      )}
    </nav>
  );
}