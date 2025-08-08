import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function MedicalPanel() {
  const { token } = useAuth();
  const [campers, setCampers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMedicalData() {
      if (!token) return;
      try {
        // In a real app, this might be a more specific, secure endpoint
        // e.g., /api/admin/medical-records
        const res = await fetch('/api/admin/campers', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch medical data.');
        }
        const data = await res.json();
        // For now, we'll just use the general camper data
        setCampers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMedicalData();
  }, [token]);

  if (isLoading) return <p>Loading medical data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h3>Camper Medical Overview</h3>
      <p>This panel provides a high-level overview of camper medical information.</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Camper Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Allergies</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Dietary Restrictions</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Medications</th>
          </tr>
        </thead>
        <tbody>
          {campers.map(camper => (
            <tr key={camper._id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '8px' }}>{camper.firstName} {camper.lastName}</td>
              {/* These fields will be populated once we add them to the Camper model */}
              <td style={{ padding: '8px' }}>{camper.medical?.allergies || 'None'}</td>
              <td style={{ padding: '8px' }}>{camper.medical?.dietaryRestrictions || 'None'}</td>
              <td style={{ padding: '8px' }}>{camper.medical?.medications?.length > 0 ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}