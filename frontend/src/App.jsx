// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import ParentLogin from './pages/ParentLogin';
import ParentProfile from './pages/ParentProfile';
import StaffApplication from './pages/StaffApplication';
import CamperRegistration from './pages/CamperRegistration';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/parent-login" element={<ParentLogin />} />
      <Route path="/parent-profile" element={<ParentProfile />} />
      <Route path="/register-camper" element={<CamperRegistration />} />
      <Route path="/staff-apply" element={<StaffApplication />} />
    </Routes>
  );
}
