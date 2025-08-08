import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';

export default function SessionManager() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: 100,
    cost: 500,
  });

  // Fetch all sessions
  async function fetchSessions() {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError('Could not load sessions.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle creating a new session
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session.');
      }
      // Reset form and refresh session list
      setFormData({ name: '', startDate: '', endDate: '', capacity: 100, cost: 500 });
      fetchSessions(); 
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deleting a session
  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchSessions(); // Refresh list
    } catch (err) {
      setError('Failed to delete session.');
    }
  };

  if (isLoading) return <p>Loading sessions...</p>;

  return (
    <div>
      <h3>Create New Session</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Session Name" required />
        <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
        <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
        <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} placeholder="Capacity" required />
        <input name="cost" type="number" value={formData.cost} onChange={handleChange} placeholder="Cost" required />
        <button type="submit">Create Session</button>
      </form>

      <hr />

      <h3>Existing Sessions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Dates</th>
            <th>Capacity</th>
            <th>Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session._id}>
              <td>{session.name}</td>
              <td>{new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}</td>
              <td>{session.spotsRemaining} / {session.capacity}</td>
              <td>${session.cost}</td>
              <td>
                <button onClick={() => handleDelete(session._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}