import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Payment() {
  const { camperId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [camper, setCamper] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchCamperDetails() {
      if (!token) return;
      try {
        const res = await fetch(`/api/campers/${camperId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch camper details.');
        const data = await res.json();
        setCamper(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCamperDetails();
  }, [camperId, token]);

  const handlePayDeposit = async () => {
    setError('');
    setProcessing(true);
    try {
      const res = await fetch(`/api/campers/${camperId}/pay-deposit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process payment.');
      }
      alert('Deposit paid successfully!');
      navigate('/parent-profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p>Loading payment details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!camper) return <p>Camper not found.</p>;

  return (
    <div>
      <h2>Confirm Deposit Payment</h2>
      <p>You are paying the deposit for:</p>
      <h3>{camper.firstName} {camper.lastName}</h3>
      <p>Session: {camper.session?.name || 'N/A'}</p>
      <p>Status: {camper.paymentStatus?.replace('_', ' ') || 'N/A'}</p>
      
      {camper.paymentStatus === 'pending_deposit' ? (
        <button onClick={handlePayDeposit} disabled={processing}>
          {processing ? 'Processing...' : 'Confirm and Pay Deposit'}
        </button>
      ) : (
         <p>No payment is currently due for this camper.</p>
      )}
    </div>
  );
}