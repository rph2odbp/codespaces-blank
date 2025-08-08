// React and React Router Imports
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Context and Authentication
import { AuthProvider, useAuth } from './AuthContext';

// Page Imports
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';
import ParentProfile from './pages/ParentProfile';
import CamperRegistration from './pages/CamperRegistration';
import Payment from './pages/Payment';
import StaffLogin from './pages/StaffLogin';
import StaffPortal from './pages/StaffPortal';
import SetPassword from './pages/SetPassword';
import ForgotPassword from './pages/ForgotPassword';
import UserProfile from './pages/UserProfile';
import CamperManagementPanel from './pages/CamperManagementPanel';
import SessionManagementPanel from './pages/SessionManagementPanel';

// Navigation Component
function Navigation() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav>
      <Link to="/" aria-label="Home" aria-current={location.pathname === "/" ? "page" : undefined}>Home</Link>
      <Link to="/register" aria-label="Register" aria-current={location.pathname === "/register" ? "page" : undefined}>Register</Link>
      {!token && (
        <>
          <Link to="/login" aria-label="Parent Login" aria-current={location.pathname === "/login" ? "page" : undefined}>Parent Login</Link>
          <Link to="/staff-login" aria-label="Staff Login" aria-current={location.pathname === "/staff-login" ? "page" : undefined}>Staff Login</Link>
        </>
      )}
      {token && user?.role === 'parent' && (
        <Link to="/parent-profile" aria-label="Parent Profile" aria-current={location.pathname === "/parent-profile" ? "page" : undefined}>Parent Profile</Link>
      )}
      {token && ['staff', 'admin', 'superadmin'].includes(user?.role) && (
        <Link to="/admin/campers" aria-label="Camper Management" aria-current={location.pathname === "/admin/campers" ? "page" : undefined}>
          Camper Management
        </Link>
      )}
      {token && user?.role === 'superadmin' && (
        <Link to="/admin/sessions" aria-label="Session Management" aria-current={location.pathname === "/admin/sessions" ? "page" : undefined}>
          Session Management
        </Link>
      )}
      {token && (
        <Link to="/my-profile" aria-label="My Profile" aria-current={location.pathname === "/my-profile" ? "page" : undefined}>My Profile</Link>
      )}
      {token && (
        <button
          onClick={handleLogout}
          aria-label="Logout"
          style={{ marginLeft: 16, cursor: 'pointer' }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}

// User Greeting Component
function UserGreeting() {
  const { user, token } = useAuth();
  if (!token || !user) return null;
  return (
    <div style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>
      Welcome, {user.firstName}!
    </div>
  );
}

// Authentication Wrapper for Protected Routes
function RequireAuth({ children, allowedRoles }) {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Forgot Password Link Component
function ForgotPasswordLink() {
  const location = useLocation();
  if (location.pathname !== "/login" && location.pathname !== "/staff-login") return null;
  return (
    <div style={{ marginTop: 12 }}>
      <Link to="/forgot-password">Forgot Password?</Link>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <header>
          <Navigation />
          <UserGreeting />
        </header>
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<><Login /><ForgotPasswordLink /></>} />
            <Route path="/staff-login" element={<><StaffLogin /><ForgotPasswordLink /></>} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Parent-only Routes */}
            <Route
              path="/parent-profile"
              element={
                <RequireAuth allowedRoles={['parent']}>
                  <ParentProfile />
                </RequireAuth>
              }
            />
            <Route
              path="/register-camper"
              element={
                <RequireAuth allowedRoles={['parent']}>
                  <CamperRegistration />
                </RequireAuth>
              }
            />
            <Route
              path="/payment/:camperId"
              element={
                <RequireAuth allowedRoles={['parent']}>
                  <Payment />
                </RequireAuth>
              }
            />

            {/* Staff/Admin-only Routes */}
            <Route
              path="/staff-portal"
              element={
                <RequireAuth allowedRoles={['staff', 'admin', 'superadmin']}>
                  <StaffPortal />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/campers"
              element={
                <RequireAuth allowedRoles={['staff', 'admin', 'superadmin']}>
                  <CamperManagementPanel />
                </RequireAuth>
              }
            />

            {/* Superadmin-only Routes */}
            <Route
              path="/admin/sessions"
              element={
                <RequireAuth allowedRoles={['superadmin']}>
                  <SessionManagementPanel />
                </RequireAuth>
              }
            />

            {/* All logged-in users: My Profile */}
            <Route
              path="/my-profile"
              element={
                <RequireAuth allowedRoles={['parent', 'staff', 'admin', 'superadmin']}>
                  <UserProfile />
                </RequireAuth>
              }
            />

            {/* Fallback for any other route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;