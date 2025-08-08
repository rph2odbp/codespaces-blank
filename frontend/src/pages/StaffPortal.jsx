import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import MedicalPanel from './MedicalPanel';
import SessionManagementPanel from './SessionManagementPanel';
// ADDITION: Import the new user management panel
import UserManagementPanel from './UserManagementPanel';

// CamperManagementView component remains the same
function CamperManagementView() {
  const { token } = useAuth();
  const [campers, setCampers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllCampers() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/campers', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch camper data.');
        }
        const data = await res.json();
        setCampers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllCampers();
  }, [token]);

  if (isLoading) return <p>Loading camper data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h3>All Registered Campers ({campers.length})</h3>
      {campers.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Camper Name</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Session</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Parent</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {campers.map(camper => (
              <tr key={camper._id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>{camper.firstName} {camper.lastName}</td>
                <td style={{ padding: '8px' }}>{camper.session?.name || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{camper.parentId?.email || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{camper.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No campers have been registered yet.</p>
      )}
    </div>
  );
}


export default function StaffPortal() {
  const { user } = useAuth();
  // ADDITION: Add 'users' to the possible views
  const [activeView, setActiveView] = useState('campers');

  return (
    <div>
      <h2>Welcome to the Staff Portal, {user?.firstName}!</h2>
      <p>Select a panel below to manage camp operations.</p>
      
      <div style={{ margin: '1rem 0', display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveView('campers')} disabled={activeView === 'campers'}>
          Camper Management
        </button>
        <button onClick={() => setActiveView('medical')} disabled={activeView === 'medical'}>
          Medical Panel
        </button>
        <button onClick={() => setActiveView('sessions')} disabled={activeView === 'sessions'}>
          Session Management
        </button>
        {/* ADDITION: Conditionally render the User Management button for superadmins */}
        {user?.role === 'superadmin' && (
          <button onClick={() => setActiveView('users')} disabled={activeView === 'users'}>
            User Management
          </button>
        )}
      </div>
      
      <hr style={{ margin: '1rem 0 2rem 0' }} />

      {activeView === 'campers' && <CamperManagementView />}
      {activeView === 'medical' && <MedicalPanel />}
      {activeView === 'sessions' && <SessionManagementPanel />}
      {/* ADDITION: Conditionally render the new panel */}
      {activeView === 'users' && <UserManagementPanel />}
    </div>
  );
}