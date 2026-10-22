import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data)).catch(() => setError('Failed to load users'));
  }, []);

  const toggleStatus = async (id, isActive) => {
    const { data } = await api.patch(`/users/${id}/status`, { isActive: !isActive });
    setUsers((prev) => prev.map((u) => (u._id === id ? data : u)));
  };

  return (
    <div className="admin-users">
      <h2>User Management</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => toggleStatus(u._id, u.isActive)}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
