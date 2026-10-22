import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Agencies() {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [myAgency, setMyAgency] = useState(null);
  const [form, setForm] = useState({ companyName: '', contactPhone: '', address: '', commissionRate: 10 });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/agencies').then((r) => {
      setAgencies(r.data);
      if (user.role === 'agency') setMyAgency(r.data.find((a) => a.user?._id === user._id || a.user === user._id));
    }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/agencies', { ...form, commissionRate: Number(form.commissionRate) });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleVerify = async (id) => {
    await api.patch(`/agencies/${id}/verify`);
    load();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Agencies</h2>
          {user.role === 'agency' && !myAgency && (
            <button onClick={() => setShowForm(!showForm)}>+ Create Profile</button>
          )}
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h3>Agency Profile</h3>
            {error && <p className="error">{error}</p>}
            <input placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
            <input placeholder="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input type="number" placeholder="Commission Rate (%)" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Company</th><th>Commission</th><th>Verified</th>{user.role === 'admin' && <th>Action</th>}</tr></thead>
            <tbody>
              {agencies.map((a) => (
                <tr key={a._id}>
                  <td>{a.companyName}</td>
                  <td>{a.commissionRate}%</td>
                  <td><span className={`badge ${a.isVerified ? 'badge-active' : 'badge-draft'}`}>{a.isVerified ? 'Verified' : 'Unverified'}</span></td>
                  {user.role === 'admin' && (
                    <td>{!a.isVerified && <button className="btn-sm" onClick={() => handleVerify(a._id)}>Verify</button>}</td>
                  )}
                </tr>
              ))}
              {agencies.length === 0 && <tr><td colSpan={4} className="empty">No agencies</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
