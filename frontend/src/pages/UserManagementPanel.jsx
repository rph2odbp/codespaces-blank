import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const ROLES = ['parent', 'staff', 'admin', 'superadmin'];

export default function UserManagementPanel() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'parent',
  });
  const [inviteMsg, setInviteMsg] = useState('');

  // Password assignment state
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    newPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch user data.');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role.');
      setUsers((users) => users.map((u) => (u._id === userId ? data : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeactivate(userId, deactivate) {
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/${deactivate ? 'deactivate' : 'activate'}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user.');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user.');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviteMsg('');
    setError('');
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite user.');
      setInviteMsg(`Invite sent! Link: ${data.inviteLink}`);
      setInviteForm({ firstName: '', lastName: '', email: '', role: 'parent' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAssignPassword(e) {
    e.preventDefault();
    setPasswordMsg('');
    setError('');
    try {
      const res = await fetch('/api/auth/assign-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign password.');
      setPasswordMsg('Password updated successfully.');
      setPasswordForm({ email: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  if (isLoading) return <p>Loading user data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>User Management</h3>
      <p>
        This panel shows all registered users in the system. Superadmins can change user roles, invite new users, and assign passwords.
      </p>
      {currentUser?.role === 'superadmin' && (
        <>
          <form onSubmit={handleInvite} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
            <h4>Invite New User</h4>
            <input
              type="text"
              placeholder="First Name"
              value={inviteForm.firstName}
              onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              style={{ marginRight: 8 }}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={inviteForm.lastName}
              onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))}
              required
              style={{ marginRight: 8 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              required
              style={{ marginRight: 8 }}
            />
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
              style={{ marginRight: 8 }}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button type="submit">Invite User</button>
            {inviteMsg && <div style={{ color: 'green', marginTop: 8 }}>{inviteMsg}</div>}
          </form>

          <form onSubmit={handleAssignPassword} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
            <h4>Assign/Update Password</h4>
            <input
              type="email"
              placeholder="User Email"
              value={passwordForm.email}
              onChange={(e) => setPasswordForm((f) => ({ ...f, email: e.target.value }))}
              required
              style={{ marginRight: 8 }}
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
              style={{ marginRight: 8 }}
            />
            <button type="submit">Update Password</button>
            {passwordMsg && <div style={{ color: 'green', marginTop: 8 }}>{passwordMsg}</div>}
          </form>
        </>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Registered On</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>
                  {user.firstName} {user.lastName}
                </td>
                <td style={{ padding: '8px' }}>{user.email}</td>
                <td style={{ padding: '8px' }}>
                  {currentUser?.role === 'superadmin' && user.email !== currentUser.email ? (
                    <select
                      value={user.role}
                      disabled={updatingId === user._id}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td style={{ padding: '8px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '8px' }}>
                  {currentUser?.role === 'superadmin' && user.email !== currentUser.email && (
                    <>
                      <button
                        onClick={() => handleDeactivate(user._id, !user.deactivated)}
                        style={{ marginRight: 8 }}
                      >
                        {user.deactivated ? 'Reactivate' : 'Deactivate'}
                      </button>
                      <button onClick={() => handleDelete(user._id)} style={{ color: 'red' }}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}