import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['draft', 'active', 'completed', 'cancelled'];

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [reports, setReports] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/campaigns/${id}`).then((r) => { setCampaign(r.data); setForm(r.data); });
    api.get(`/purchases?campaignId=${id}`).then((r) => setPurchases(r.data)).catch(() => {});
    api.get(`/reports?campaignId=${id}`).then((r) => setReports(r.data)).catch(() => {});
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.put(`/campaigns/${id}`, {
        title: form.title, description: form.description,
        budget: Number(form.budget), status: form.status,
      });
      setCampaign(data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (!campaign) return <><Navbar /><div className="page">Loading...</div></>;

  const canEdit = user.role === 'admin' || campaign.advertiser?._id === user._id || campaign.advertiser === user._id;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>{campaign.title}</h2>
          {canEdit && <button onClick={() => setEditing(!editing)}>Edit</button>}
        </div>

        {editing && (
          <form className="card form-card" onSubmit={handleUpdate}>
            {error && <p className="error">{error}</p>}
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Budget" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="card">
          <div className="detail-grid">
            <div><label>Status</label><span className={`badge badge-${campaign.status}`}>{campaign.status}</span></div>
            <div><label>Budget</label><span>${campaign.budget?.toLocaleString()}</span></div>
            <div><label>Spent</label><span>${campaign.spent?.toLocaleString()}</span></div>
            <div><label>Objective</label><span>{campaign.objective?.replace('_', ' ')}</span></div>
            <div><label>Start</label><span>{new Date(campaign.startDate).toLocaleDateString()}</span></div>
            <div><label>End</label><span>{new Date(campaign.endDate).toLocaleDateString()}</span></div>
            {campaign.blockchainTxHash && <div><label>Blockchain Tx</label><span className="hash">{campaign.blockchainTxHash}</span></div>}
          </div>
        </div>

        <h3>Purchases ({purchases.length})</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Publisher</th><th>Placement</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id}>
                  <td>{p.publisher?.companyName}</td>
                  <td>{p.placement?.name}</td>
                  <td>{p.quantity}</td>
                  <td>${p.totalCost?.toLocaleString()}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan={5} className="empty">No purchases</td></tr>}
            </tbody>
          </table>
        </div>

        <h3>Delivery Reports ({reports.length})</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Publisher</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CPM</th><th>Status</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.publisher?.companyName}</td>
                  <td>{r.impressions?.toLocaleString()}</td>
                  <td>{r.clicks?.toLocaleString()}</td>
                  <td>{r.ctr}%</td>
                  <td>${r.cpm}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={6} className="empty">No reports</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="page-header" style={{ marginTop: '1.5rem' }}>
          <Link to={`/analytics/${id}`} className="btn-sm">View Analytics</Link>
        </div>
      </div>
    </>
  );
}
