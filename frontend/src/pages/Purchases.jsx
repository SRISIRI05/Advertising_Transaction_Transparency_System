import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Purchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [form, setForm] = useState({ campaignId: '', publisherId: '', placementId: '', quantity: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/purchases').then((r) => setPurchases(r.data)).catch(() => {});

  useEffect(() => {
    load();
    if (user.role === 'advertiser' || user.role === 'admin') {
      api.get('/campaigns').then((r) => setCampaigns(r.data.filter((c) => c.status === 'active'))).catch(() => {});
      api.get('/publishers').then((r) => setPublishers(r.data)).catch(() => {});
    }
  }, []);

  const handlePublisherChange = (e) => {
    const pub = publishers.find((p) => p._id === e.target.value);
    setSelectedPublisher(pub || null);
    setForm({ ...form, publisherId: e.target.value, placementId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/purchases', { ...form, quantity: Number(form.quantity) });
      setForm({ campaignId: '', publisherId: '', placementId: '', quantity: '' });
      setSelectedPublisher(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleStatus = async (id, status) => {
    await api.patch(`/purchases/${id}/status`, { status });
    load();
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this purchase?')) return;
    await api.patch(`/purchases/${id}/cancel`);
    load();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Media Purchases</h2>
          {(user.role === 'advertiser' || user.role === 'admin') && (
            <button onClick={() => setShowForm(!showForm)}>+ New Purchase</button>
          )}
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h3>Create Purchase</h3>
            {error && <p className="error">{error}</p>}
            <select value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })} required>
              <option value="">Select Campaign</option>
              {campaigns.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <select value={form.publisherId} onChange={handlePublisherChange} required>
              <option value="">Select Publisher</option>
              {publishers.map((p) => <option key={p._id} value={p._id}>{p.companyName}</option>)}
            </select>
            {selectedPublisher && (
              <select value={form.placementId} onChange={(e) => setForm({ ...form, placementId: e.target.value })} required>
                <option value="">Select Placement</option>
                {selectedPublisher.placements?.filter((p) => p.isActive).map((p) => (
                  <option key={p._id} value={p._id}>{p.name} — ${p.pricePerUnit}/{p.unitType} ({p.availableInventory} avail)</option>
                ))}
              </select>
            )}
            <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <div className="form-actions">
              <button type="submit">Submit</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Campaign</th><th>Publisher</th><th>Placement</th><th>Qty</th><th>Total</th><th>Agency Fee</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id}>
                  <td>{p.campaign?.title}</td>
                  <td>{p.publisher?.companyName}</td>
                  <td>{p.placement?.name}</td>
                  <td>{p.quantity}</td>
                  <td>${p.totalCost?.toLocaleString()}</td>
                  <td>${p.agencyFee?.toLocaleString()}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>
                    {user.role === 'admin' && p.status === 'pending' && (
                      <>
                        <button className="btn-sm" onClick={() => handleStatus(p._id, 'approved')}>Approve</button>
                        <button className="btn-sm btn-danger" onClick={() => handleStatus(p._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {p.status === 'pending' && (user.role === 'admin' || p.purchasedBy?._id === user._id || p.purchasedBy === user._id) && (
                      <button className="btn-sm btn-secondary" onClick={() => handleCancel(p._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan={8} className="empty">No purchases</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
