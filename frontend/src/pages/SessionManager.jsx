import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    _id: null,
    name: '',
    startDate: '',
    endDate: '',
    capacity: '',
    cost: '',
  });
  const { token } = useAuth();

  // Fetch all sessions
  async function fetchSessions() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (res.ok) {
        setSessions(data);
      } else {
        setError(data.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('An error occurred while fetching sessions.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ _id: null, name: '', startDate: '', endDate: '', capacity: '', cost: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const method = formData._id ? 'PUT' : 'POST';
    const url = formData._id ? `/api/sessions/${formData._id}` : '/api/sessions';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        fetchSessions(); // Refresh the list
        resetForm();
      } else {
        setError(data.error || 'Failed to save session.');
      }
    } catch (err) {
      setError('An error occurred while saving the session.');
    }
  };

  const handleEdit = (session) => {
    setFormData({
      _id: session._id,
      name: session.name,
      // Dates need to be formatted as YYYY-MM-DD for the input field
      startDate: new Date(session.startDate).toISOString().split('T')[0],
      endDate: new Date(session.endDate).toISOString().split('T')[0],
      capacity: session.capacity,
      cost: session.cost,
    });
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    setError('');
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchSessions(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete session.');
      }
    } catch (err) {
      setError('An error occurred while deleting the session.');
    }
  };

  if (isLoading) return <p>Loading sessions...</p>;

  return (
    <div>
      <h3>Session Management</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Form for creating/editing sessions */}
      <form onSubmit={handleFormSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h4>{formData._id ? 'Edit Session' : 'Create New Session'}</h4>
        <input type="text" name="name" placeholder="Session Name" value={formData.name} onChange={handleInputChange} required />
        <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
        <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleInputChange} required />
        <input type="number" name="cost" placeholder="Cost ($)" value={formData.cost} onChange={handleInputChange} required />
        <button type="submit">{formData._id ? 'Update Session' : 'Create Session'}</button>
        {formData._id && <button type="button" onClick={resetForm}>Cancel Edit</button>}
      </form>

      {/* List of existing sessions */}
      <h4>Existing Sessions</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sessions.map(session => (
          <div key={session._id} style={{ border: '1px solid #eee', padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{session.name} ({new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}) - Capacity: {session.capacity}</span>
            <div>
              <button onClick={() => handleEdit(session)}>Edit</button>
              <button onClick={() => handleDelete(session._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}