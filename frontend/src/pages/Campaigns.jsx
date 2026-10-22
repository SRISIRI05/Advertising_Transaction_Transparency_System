import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const EMPTY = { title: '', description: '', budget: '', startDate: '', endDate: '', objective: 'brand_awareness' };
const OBJECTIVES = ['brand_awareness', 'lead_generation', 'conversions', 'traffic', 'engagement'];

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/campaigns').then((r) => setCampaigns(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/campaigns', { ...form, budget: Number(form.budget) });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    await api.delete(`/campaigns/${id}`);
    load();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Campaigns</h2>
          {(user.role === 'advertiser' || user.role === 'admin') && (
            <button onClick={() => setShowForm(!showForm)}>+ New Campaign</button>
          )}
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h3>Create Campaign</h3>
            {error && <p className="error">{error}</p>}
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required />
            <input type="date" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <input type="date" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            <select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}>
              {OBJECTIVES.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
            <div className="form-actions">
              <button type="submit">Create</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Objective</th><th>Budget</th><th>Spent</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id}>
                  <td><Link to={`/campaigns/${c._id}`}>{c.title}</Link></td>
                  <td>{c.objective.replace('_', ' ')}</td>
                  <td>${c.budget.toLocaleString()}</td>
                  <td>${c.spent.toLocaleString()}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>
                    <Link to={`/campaigns/${c._id}`} className="btn-sm">View</Link>
                    {c.status === 'draft' && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && <tr><td colSpan={6} className="empty">No campaigns found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
