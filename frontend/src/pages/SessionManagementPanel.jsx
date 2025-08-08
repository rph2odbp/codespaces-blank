import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

// Helper to format dates for input fields
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

export default function SessionManagementPanel() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [campers, setCampers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filter, setFilter] = useState({
    session: '',
    status: '',
    registrationStatus: '',
    cabin: ''
  });

  // State for the session form
  const [isEditing, setIsEditing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: '',
    cost: '',
  });

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchCampers();
    // eslint-disable-next-line
  }, [filter, sessions.length]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sessions.');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampers = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await fetch(`/api/admin/campers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch campers.');
      const data = await res.json();
      setCampers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = e => {
    setFilter(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentSessionId(null);
    setFormData({ name: '', startDate: '', endDate: '', capacity: '', cost: '' });
  };

  const handleEditClick = (session) => {
    setIsEditing(true);
    setCurrentSessionId(session._id);
    setFormData({
      name: session.name,
      startDate: formatDateForInput(session.startDate),
      endDate: formatDateForInput(session.endDate),
      capacity: session.capacity,
      cost: session.cost,
    });
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete session.');
      alert('Session deleted successfully.');
      fetchSessions(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const url = isEditing ? `/api/admin/sessions/${currentSessionId}` : '/api/admin/sessions';
    const method = isEditing ? 'PUT' : 'POST';

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
      if (!res.ok) throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} session.`);
      alert(`Session ${isEditing ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchSessions(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignSession = async (camperId, sessionId) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/campers/${camperId}/session`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign session.');
      fetchCampers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <p>Loading sessions...</p>;

  return (
    <div>
      <h3>Session Management</h3>
      {/* Form for Creating/Editing Sessions */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
        <h4>{isEditing ? 'Edit Session' : 'Create New Session'}</h4>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input type="text" name="name" placeholder="Session Name" value={formData.name} onChange={handleInputChange} required />
        <input type="number" name="cost" placeholder="Cost" value={formData.cost} onChange={handleInputChange} required />
        <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleInputChange} required />
        <label>Start Date: <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required /></label>
        <label>End Date: <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required /></label>
        <button type="submit">{isEditing ? 'Update Session' : 'Create Session'}</button>
        {isEditing && <button type="button" onClick={resetForm}>Cancel Edit</button>}
      </form>

      {/* Table of Existing Sessions */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Dates</th>
            <th>Cost</th>
            <th>Capacity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session._id}>
              <td>{session.name}</td>
              <td>{formatDateForInput(session.startDate)} to {formatDateForInput(session.endDate)}</td>
              <td>${session.cost}</td>
              <td>{session.capacity}</td>
              <td>
                <button onClick={() => handleEditClick(session)}>Edit</button>
                <button onClick={() => handleDelete(session._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Camper Filters */}
      <h3 style={{ marginTop: '2rem' }}>Registered Campers</h3>
      <div style={{ margin: '1rem 0' }}>
        <select name="session" value={filter.session} onChange={handleFilterChange}>
          <option value="">All Sessions</option>
          {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select name="status" value={filter.status} onChange={handleFilterChange} style={{ marginLeft: 8 }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="waitlist">Waitlist</option>
        </select>
        <select name="registrationStatus" value={filter.registrationStatus} onChange={handleFilterChange} style={{ marginLeft: 8 }}>
          <option value="">All Registration Statuses</option>
          <option value="complete">Complete</option>
          <option value="pending">Pending</option>
        </select>
        <input
          name="cabin"
          value={filter.cabin}
          onChange={handleFilterChange}
          placeholder="Cabin"
          style={{ marginLeft: 8 }}
        />
        <button onClick={fetchCampers} style={{ marginLeft: 8 }}>Apply Filters</button>
      </div>

      {/* Camper Session Assignment */}
      <table>
        <thead>
          <tr>
            <th>Camper Name</th>
            <th>Parent Email</th>
            <th>Status</th>
            <th>Registration Status</th>
            <th>Cabin</th>
            <th>Current Session</th>
            <th>Assign/Move to Session</th>
          </tr>
        </thead>
        <tbody>
          {campers.map(camper => (
            <tr key={camper._id}>
              <td>{camper.firstName} {camper.lastName}</td>
              <td>{camper.parentId?.email || ''}</td>
              <td>{camper.status}</td>
              <td>{camper.registrationStatus}</td>
              <td>{camper.cabin || <em>None</em>}</td>
              <td>{camper.session?.name || <em>None</em>}</td>
              <td>
                <select
                  value={camper.session?._id || ''}
                  onChange={e => handleAssignSession(camper._id, e.target.value)}
                >
                  <option value="">-- Select Session --</option>
                  {sessions.map(session => (
                    <option key={session._id} value={session._id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}