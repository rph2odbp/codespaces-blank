import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ParentRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful! Please log in.');
        navigate('/parent-login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Registration failed');
    }
  }

  return (
    <div>
      <h2>Parent Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/parent-login">Login here</Link>
      </p>
    </div>
  );
}