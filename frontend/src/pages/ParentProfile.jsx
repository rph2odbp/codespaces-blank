import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ParentProfile() {
  const { user, token } = useAuth();
  const [myCampers, setMyCampers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyCampers() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/parent/my-campers', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch your campers.');
        }
        const data = await res.json();
        setMyCampers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyCampers();
  }, [token]);

  if (isLoading) return <p>Loading your profile...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Welcome, {user?.firstName}!</h2>
      <p>This is your parent dashboard. Here you can manage your campers and payments.</p>
      
      <Link to="/register-camper">
        <button style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          Register a New Camper
        </button>
      </Link>

      <h3>Your Registered Campers</h3>
      {myCampers.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Session</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Payment Status</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {myCampers.map(camper => (
              <tr key={camper._id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>{camper.firstName} {camper.lastName}</td>
                <td style={{ padding: '8px' }}>{camper.session?.name || 'N/A'}</td>
                <td style={{ padding: '8px' }}>{camper.paymentStatus?.replace('_', ' ')}</td>
                <td style={{ padding: '8px' }}>
                  {camper.paymentStatus === 'pending_deposit' && (
                    <button onClick={() => navigate(`/payment/${camper._id}`)}>
                      Pay Deposit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You have not registered any campers yet.</p>
      )}
    </div>
  );
}