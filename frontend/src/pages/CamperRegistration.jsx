import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function CamperRegistration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    session: '',
  });
  
  // ADDITION: State for the new medical fields
  const [medical, setMedical] = useState({
    allergies: '',
    dietaryRestrictions: '',
    medications: [],
  });

  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSessions() {
      if (!token) {
        console.log('CamperRegistration: No token available, skipping fetch');
        setError('Authentication required to view sessions');
        return;
      }

      console.log('CamperRegistration: Fetching sessions with token:', token ? 'Token present' : 'No token');
      try {
        const res = await fetch('/api/sessions', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
        });
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchSessions();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ADDITION: Handlers for the medical form fields
  const handleMedicalChange = (e) => {
    setMedical({ ...medical, [e.target.name]: e.target.value });
  };

  const handleMedicationChange = (index, e) => {
    const newMeds = [...medical.medications];
    newMeds[index][e.target.name] = e.target.value;
    setMedical({ ...medical, medications: newMeds });
  };

  const addMedication = () => {
    setMedical({
      ...medical,
      medications: [...medical.medications, { name: '', dosage: '', frequency: '' }],
    });
  };

  const removeMedication = (index) => {
    const newMeds = medical.medications.filter((_, i) => i !== index);
    setMedical({ ...medical, medications: newMeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const registrationData = {
      ...formData,
      medical, // Include the medical object in the payload
    };

    try {
      const res = await fetch('/api/campers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register camper.');
      }
      
      alert('Camper registered successfully! Please proceed to pay the deposit.');
      // Redirect to the payment page for the newly registered camper
      navigate(`/payment/${data._id}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register a New Camper</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <fieldset>
        <legend>Camper Information</legend>
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
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
        </div>
        <div>
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
        </div>
        <div>
          <label>Select a Session</label>
          <select name="session" value={formData.session} onChange={handleChange} required>
            <option value="">--Please choose a session--</option>
            {sessions.map(s => (
              <option key={s._id} value={s._id}>{s.name} (${s.cost})</option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* ADDITION: New medical information section */}
      <fieldset>
        <legend>Medical Information</legend>
        <div>
          <label>Allergies (e.g., peanuts, pollen, bee stings)</label>
          <textarea name="allergies" value={medical.allergies} onChange={handleMedicalChange} />
        </div>
        <div>
          <label>Dietary Restrictions (e.g., vegetarian, gluten-free)</label>
          <textarea name="dietaryRestrictions" value={medical.dietaryRestrictions} onChange={handleMedicalChange} />
        </div>
        <div>
          <label>Medications</label>
          {medical.medications.map((med, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <input type="text" name="name" placeholder="Medication Name" value={med.name} onChange={(e) => handleMedicationChange(index, e)} required />
              <input type="text" name="dosage" placeholder="Dosage (e.g., 1 pill, 10mg)" value={med.dosage} onChange={(e) => handleMedicationChange(index, e)} required />
              <input type="text" name="frequency" placeholder="Frequency (e.g., twice daily)" value={med.frequency} onChange={(e) => handleMedicationChange(index, e)} required />
              <button type="button" onClick={() => removeMedication(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addMedication}>Add Medication</button>
        </div>
      </fieldset>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register Camper'}
      </button>
    </form>
  );
}