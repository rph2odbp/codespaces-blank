// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Camp Abbey Portal</h1>
      <nav>
        <Link to="/admin-login">Admin Login</Link> |{' '}
        <Link to="/parent-login">Parent Login</Link> |{' '}
        <Link to="/staff-apply">Staff Application</Link>
      </nav>
    </div>
  );
}
