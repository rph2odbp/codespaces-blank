import React from 'react';
import SessionManager from '../components/admin/SessionManager';

export default function AdminPanel() {
  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Manage camp operations from this dashboard.</p>
      <SessionManager />
    </div>
  );
}