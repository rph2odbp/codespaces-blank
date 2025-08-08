import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function SessionList() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSessions() {
      if (!token) {
        console.log('SessionList: No token available, skipping fetch');
        setError('Authentication required to view sessions');
        setIsLoading(false);
        return;
      }

      console.log('SessionList: Fetching sessions with token:', token ? 'Token present' : 'No token');
      try {
        const res = await fetch('/api/sessions', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
        });
        const data = await res.json();
        if (res.ok) {
          setSessions(data);
        } else {
          setError(data.error || 'Failed to fetch sessions');
        }
      } catch (err) {
        console.error('SessionList: Error fetching sessions:', err.message);
        setError('An error occurred while fetching sessions.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, [token]);

  if (isLoading) return <p>Loading sessions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>Available Sessions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Session Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Dates</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Cost</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Spots Remaining</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session._id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '8px' }}>{session.name}</td>
              <td style={{ padding: '8px' }}>{new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}</td>
              <td style={{ padding: '8px' }}>${session.cost}</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>
                {session.spotsRemaining > 0 ? `${session.spotsRemaining} / ${session.capacity}` : 'Waitlist Only'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}