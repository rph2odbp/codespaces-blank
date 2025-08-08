import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function CamperManagementPanel() {
  const { token } = useAuth();
  const [campers, setCampers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filter, setFilter] = useState({
    session: '',
    status: '',
    registrationStatus: '',
    cabin: ''
  });

  useEffect(() => {
    fetchSessions();
    fetchCampers();
    // eslint-disable-next-line
  }, [filter]);

  const fetchCampers = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sessions.');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (e) => {
    setFilter((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const exportCampersToCSV = () => {
    if (campers.length === 0) {
      alert('No campers available to export.');
      return;
    }

    // Define CSV headers
    const headers = ['First Name', 'Last Name', 'Parent Email', 'Status', 'Registration Status', 'Cabin', 'Session'];

    // Map camper data to CSV rows
    const rows = campers.map((camper) => [
      camper.firstName,
      camper.lastName,
      camper.parentId?.email || '',
      camper.status,
      camper.registrationStatus,
      camper.cabin || 'None',
      camper.session?.name || 'None',
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(',')) // Convert each row to a comma-separated string
      .join('\n'); // Join rows with a newline

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <p>Loading campers...</p>;

  return (
    <div>
      <h3>Camper Management</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Export Button */}
      <button onClick={exportCampersToCSV} style={{ marginBottom: '1rem' }}>
        Export Campers to CSV
      </button>

      {/* Camper Filters */}
      <div style={{ margin: '1rem 0' }}>
        <select name="session" value={filter.session} onChange={handleFilterChange} aria-label="Filter by session">
          <option value="">All Sessions</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="status" value={filter.status} onChange={handleFilterChange} style={{ marginLeft: 8 }} aria-label="Filter by status">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="waitlist">Waitlist</option>
        </select>
        <select
          name="registrationStatus"
          value={filter.registrationStatus}
          onChange={handleFilterChange}
          style={{ marginLeft: 8 }}
          aria-label="Filter by registration status"
        >
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
          aria-label="Filter by cabin"
        />
        <button onClick={fetchCampers} style={{ marginLeft: 8 }}>
          Apply Filters
        </button>
      </div>

      {/* Camper Table */}
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Parent Email</th>
            <th>Status</th>
            <th>Registration Status</th>
            <th>Cabin</th>
            <th>Session</th>
          </tr>
        </thead>
        <tbody>
          {campers.length > 0 ? (
            campers.map((camper) => (
              <tr key={camper._id}>
                <td>{camper.firstName}</td>
                <td>{camper.lastName}</td>
                <td>{camper.parentId?.email || ''}</td>
                <td>{camper.status}</td>
                <td>{camper.registrationStatus}</td>
                <td>{camper.cabin || <em>None</em>}</td>
                <td>{camper.session?.name || <em>None</em>}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                No campers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}