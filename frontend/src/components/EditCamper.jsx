import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function EditCamper() {
  const { camperId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        setError('Authentication required.');
        setIsLoading(false);
        return;
      }
      try {
        // Fetch both camper details and all sessions
        const [camperRes, sessionsRes] = await Promise.all([
          fetch(`/api/campers/${camperId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/sessions', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!camperRes.ok || !sessionsRes.ok) {
          throw new Error('Failed to load required data.');
        }

        const camperData = await camperRes.json();
        const sessionsData = await sessionsRes.json();

        setFormData(camperData);
        setSessions(sessionsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [camperId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`/api/campers/${camperId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Camper details updated successfully!');
        navigate('/parent-profile');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update camper details.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    }
  };

  if (isLoading) return <p>Loading camper details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!formData) return <p>No camper data found.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit {formData.firstName}'s Registration</h2>
      
      <div>
        <label>First Name</label>
        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
      </div>
      <div>
        <label>Last Name</label>
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </div>
      <div>
        <label>Date of Birth</label>
        <input type="date" name="dateOfBirth" value={new Date(formData.dateOfBirth).toISOString().split('T')[0]} onChange={handleChange} required />
      </div>
      <div>
        <label>Session</label>
        <select name="session" value={formData.session} onChange={handleChange} required>
          <option value="">Select a Session</option>
          {sessions.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()})</option>
          ))}
        </select>
      </div>
      <div>
        <label>Notes</label>
        <textarea name="notes" value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      <button type="submit">Save Changes</button>
      <button type="button" onClick={() => navigate('/parent-profile')} style={{ marginLeft: '1rem' }}>Cancel</button>
    </form>
  );
}