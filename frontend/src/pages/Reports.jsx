import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [form, setForm] = useState({ mediaPurchaseId: '', impressions: '', clicks: '', spend: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [showFlagged, setShowFlagged] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/reports').then((r) => setReports(r.data)).catch(() => {});
    api.get('/reports/flagged').then((r) => setFlagged(r.data)).catch(() => {});
  };

  useEffect(() => {
    load();
    if (user.role === 'publisher' || user.role === 'admin') {
      api.get('/purchases').then((r) => setPurchases(r.data.filter((p) => p.status === 'approved'))).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reports', {
        mediaPurchaseId: form.mediaPurchaseId,
        impressions: Number(form.impressions),
        clicks: Number(form.clicks),
        spend: Number(form.spend),
        reportingPeriod: { startDate: form.startDate, endDate: form.endDate },
      });
      setForm({ mediaPurchaseId: '', impressions: '', clicks: '', spend: '', startDate: '', endDate: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleStatus = async (id, status) => {
    await api.patch(`/reports/${id}/status`, { status });
    load();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Delivery Reports</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(user.role === 'advertiser' || user.role === 'admin') && flagged.length > 0 && (
              <button className="btn-danger" onClick={() => setShowFlagged(!showFlagged)}>
                ⚠ Flagged ({flagged.length})
              </button>
            )}
            {(user.role === 'publisher' || user.role === 'admin') && (
              <button onClick={() => setShowForm(!showForm)}>+ Submit Report</button>
            )}
          </div>
        </div>

        {showFlagged && (
          <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #dc2626' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '0.75rem' }}>⚠ Flagged Reports</h3>
            {flagged.map((r) => (
              <div key={r._id} className="flagged-item">
                <span>{r.publisher?.companyName} — {r.campaign?.title}</span>
                <span className="flag-reason">{r.flagReason}</span>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <h3>Submit Delivery Report</h3>
            {error && <p className="error">{error}</p>}
            <select value={form.mediaPurchaseId} onChange={(e) => setForm({ ...form, mediaPurchaseId: e.target.value })} required>
              <option value="">Select Approved Purchase</option>
              {purchases.map((p) => (
                <option key={p._id} value={p._id}>{p.campaign?.title} — {p.publisher?.companyName} — {p.placement?.name}</option>
              ))}
            </select>
            <input type="number" placeholder="Impressions" value={form.impressions} onChange={(e) => setForm({ ...form, impressions: e.target.value })} />
            <input type="number" placeholder="Clicks" value={form.clicks} onChange={(e) => setForm({ ...form, clicks: e.target.value })} />
            <input type="number" placeholder="Spend ($)" value={form.spend} onChange={(e) => setForm({ ...form, spend: e.target.value })} />
            <label>Reporting Period</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            <div className="form-actions">
              <button type="submit">Submit</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Campaign</th><th>Publisher</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CPM</th><th>Flagged</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className={r.isFlagged ? 'row-flagged' : ''}>
                  <td>{r.campaign?.title}</td>
                  <td>{r.publisher?.companyName}</td>
                  <td>{r.impressions?.toLocaleString()}</td>
                  <td>{r.clicks?.toLocaleString()}</td>
                  <td>{r.ctr}%</td>
                  <td>${r.cpm}</td>
                  <td>{r.isFlagged ? <span className="badge badge-cancelled">⚠ Yes</span> : '—'}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td>
                    {(user.role === 'advertiser' || user.role === 'admin') && r.status === 'pending' && (
                      <>
                        <button className="btn-sm" onClick={() => handleStatus(r._id, 'approved')}>Approve</button>
                        <button className="btn-sm btn-danger" onClick={() => handleStatus(r._id, 'disputed')}>Dispute</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={9} className="empty">No reports</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
