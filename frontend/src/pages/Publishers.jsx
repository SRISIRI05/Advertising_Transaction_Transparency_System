import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['news', 'entertainment', 'sports', 'technology', 'lifestyle', 'finance', 'other'];

export default function Publishers() {
  const { user } = useAuth();
  const [publishers, setPublishers] = useState([]);
  const [myPublisher, setMyPublisher] = useState(null);
  const [form, setForm] = useState({ companyName: '', website: '', audienceCategory: 'news', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/publishers').then((r) => {
      setPublishers(r.data);
      if (user.role === 'publisher') setMyPublisher(r.data.find((p) => p.user?._id === user._id || p.user === user._id));
    }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/publishers', form);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleVerify = async (id) => {
    await api.patch(`/publishers/${id}/verify`);
    load();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Publishers</h2>
          {user.role === 'publisher' && !myPublisher && (
            <button onClick={() => setShowForm(!showForm)}>+ Create Profile</button>
          )}
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h3>Publisher Profile</h3>
            {error && <p className="error">{error}</p>}
            <input placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
            <input placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <select value={form.audienceCategory} onChange={(e) => setForm({ ...form, audienceCategory: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Company</th><th>Category</th><th>Website</th><th>Verified</th><th>Actions</th></tr></thead>
            <tbody>
              {publishers.map((p) => (
                <tr key={p._id}>
                  <td>{p.companyName}</td>
                  <td>{p.audienceCategory}</td>
                  <td><a href={p.website} target="_blank" rel="noreferrer">{p.website}</a></td>
                  <td><span className={`badge ${p.isVerified ? 'badge-active' : 'badge-draft'}`}>{p.isVerified ? 'Verified' : 'Unverified'}</span></td>
                  <td>
                    <Link to={`/publishers/${p._id}`} className="btn-sm">View</Link>
                    {user.role === 'admin' && !p.isVerified && (
                      <button className="btn-sm" onClick={() => handleVerify(p._id)}>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
              {publishers.length === 0 && <tr><td colSpan={5} className="empty">No publishers</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
