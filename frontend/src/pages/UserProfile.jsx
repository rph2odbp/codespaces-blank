import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function UserProfile() {
  const { token, setUser } = useAuth();

  // Profile form state
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Avatar state
  const [avatar, setAvatar] = useState('');
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarError, setAvatarError] = useState('');

  // Change password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setForm({ firstName: data.firstName, lastName: data.lastName, email: data.email });
          setAvatar(data.avatar || '');
        }
      } catch {}
    }
    fetchProfile();
  }, [token]);

  // Handle profile update
  async function handleProfileSubmit(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
      setMsg('Profile updated!');
      setUser && setUser(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle avatar upload
  async function handleAvatarChange(e) {
    setAvatarMsg('');
    setAvatarError('');
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload avatar.');
      setAvatar(data.avatar);
      setAvatarMsg('Avatar updated!');
      setUser && setUser(u => ({ ...u, avatar: data.avatar }));
    } catch (err) {
      setAvatarError(err.message);
    }
  }

  // Handle password change
  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setPwMsg('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc' }}>
      <h2>My Profile</h2>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img
          src={avatar ? avatar : '/default-avatar.png'}
          alt="Avatar"
          style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1px solid #aaa' }}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ marginTop: 8 }}
          />
        </div>
        {avatarMsg && <div style={{ color: 'green', marginTop: 8 }}>{avatarMsg}</div>}
        {avatarError && <div style={{ color: 'red', marginTop: 8 }}>{avatarError}</div>}
      </div>
      <form onSubmit={handleProfileSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          required
          style={{ display: 'block', marginBottom: 12, width: '100%' }}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          required
          style={{ display: 'block', marginBottom: 12, width: '100%' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
          style={{ display: 'block', marginBottom: 12, width: '100%' }}
        />
        <button type="submit">Update Profile</button>
        {msg && <div style={{ color: 'green', marginTop: 8 }}>{msg}</div>}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>

      <h3 style={{ marginTop: 32 }}>Change Password</h3>
      <form onSubmit={handlePasswordChange} style={{ marginTop: 8 }}>
        <input
          type="password"
          placeholder="Current Password"
          value={pwForm.currentPassword}
          onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
          required
          style={{ display: 'block', marginBottom: 12, width: '100%' }}
        />
        <input
          type="password"
          placeholder="New Password"
          value={pwForm.newPassword}
          onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
          required
          style={{ display: 'block', marginBottom: 12, width: '100%' }}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={pwForm.confirm}
          onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
          required
          style={{ display: 'block', marginBottom: 12, width: '100%' }}
        />
        <button type="submit">Change Password</button>
        {pwMsg && <div style={{ color: 'green', marginTop: 8 }}>{pwMsg}</div>}
        {pwError && <div style={{ color: 'red', marginTop: 8 }}>{pwError}</div>}
      </form>
    </div>
  );
}