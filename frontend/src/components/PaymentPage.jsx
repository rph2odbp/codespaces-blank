import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function PaymentPage() {
  const { camperId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [camper, setCamper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCamperDetails() {
      if (!token) {
        setError('Authentication required.');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/campers/${camperId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not fetch camper details.');
        
        const data = await res.json();
        // We need to fetch session details separately if they are not populated fully
        const sessionRes = await fetch(`/api/sessions/${data.session}`);
        if(!sessionRes.ok) throw new Error('Could not fetch session details.');

        const sessionData = await sessionRes.json();
        data.sessionDetails = sessionData; // Attach full session details
        setCamper(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCamperDetails();
  }, [camperId, token]);

  const handleConfirmDeposit = async () => {
    try {
      const res = await fetch(`/api/campers/${camperId}/pay-deposit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert('Deposit paid successfully! Your spot is confirmed.');
        navigate('/parent-profile');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process payment.');
      }
    } catch (err) {
      setError('An error occurred during payment confirmation.');
    }
  };

  if (isLoading) return <p>Loading payment details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!camper) return <p>No camper data found.</p>;

  return (
    <div>
      <h2>Payment for {camper.firstName} {camper.lastName}</h2>
      <p><strong>Session:</strong> {camper.sessionDetails?.name}</p>
      <p><strong>Total Cost:</strong> ${camper.sessionDetails?.cost}</p>
      <hr />
      <h3>Confirm Your Spot</h3>
      <p>To confirm your camper's spot, please pay the deposit.</p>
      <button onClick={handleConfirmDeposit}>Pay Deposit Now</button>
    </div>
  );
}