import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Analytics() {
  const { campaignId } = useParams();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState(campaignId || '');
  const [summary, setSummary] = useState(null);
  const [spend, setSpend] = useState([]);
  const [transparency, setTransparency] = useState(null);
  const [tab, setTab] = useState('summary');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/campaigns').then((r) => setCampaigns(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setError('');
    setSummary(null); setSpend([]); setTransparency(null);
    Promise.all([
      api.get(`/analytics/campaigns/${selectedId}/summary`),
      api.get(`/analytics/campaigns/${selectedId}/spend`),
    ]).then(([s, sp]) => { setSummary(s.data); setSpend(sp.data); }).catch((err) => {
      setError(err.response?.data?.message || 'Failed to load analytics');
    });
  }, [selectedId]);

  const loadTransparency = () => {
    api.get(`/analytics/campaigns/${selectedId}/transparency`)
      .then((r) => setTransparency(r.data))
      .catch(() => {});
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header"><h2>Analytics</h2></div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">Select Campaign</option>
            {campaigns.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        {summary && (
          <>
            <div className="tab-bar">
              {['summary', 'spend', 'transparency'].map((t) => (
                <button key={t} className={`tab ${tab === t ? 'active' : ''}`}
                  onClick={() => { setTab(t); if (t === 'transparency' && !transparency) loadTransparency(); }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === 'summary' && (
              <div className="analytics-grid">
                <div className="stat-card"><label>Budget</label><span>${summary.campaign.budget?.toLocaleString()}</span></div>
                <div className="stat-card"><label>Spent</label><span>${summary.campaign.spent?.toLocaleString()}</span></div>
                <div className="stat-card"><label>Utilization</label><span>{summary.budgetUtilization}%</span></div>
                <div className="stat-card"><label>Impressions</label><span>{summary.reports.totalImpressions?.toLocaleString()}</span></div>
                <div className="stat-card"><label>Clicks</label><span>{summary.reports.totalClicks?.toLocaleString()}</span></div>
                <div className="stat-card"><label>CTR</label><span>{summary.reports.ctr}%</span></div>
                <div className="stat-card"><label>CPM</label><span>${summary.reports.cpm}</span></div>
                <div className="stat-card"><label>Purchases</label><span>{summary.purchases.total} ({summary.purchases.approved} approved)</span></div>
                <div className="stat-card"><label>Payments Pending</label><span>{summary.payments.pending}</span></div>
                <div className="stat-card"><label>Payments Paid</label><span>{summary.payments.paid}</span></div>
              </div>
            )}

            {tab === 'spend' && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Publisher</th><th>Purchases</th><th>Total Cost</th><th>Agency Fee</th></tr></thead>
                  <tbody>
                    {spend.map((s, i) => (
                      <tr key={i}>
                        <td>{s.publisher}</td>
                        <td>{s.purchases}</td>
                        <td>${s.totalCost?.toLocaleString()}</td>
                        <td>${s.agencyFee?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {spend.length === 0 && <tr><td colSpan={4} className="empty">No spend data</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'transparency' && transparency && (
              <div>
                <h3>Purchases ({transparency.purchases?.length})</h3>
                <div className="table-wrap" style={{ marginBottom: '1rem' }}>
                  <table>
                    <thead><tr><th>Publisher</th><th>Placement</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {transparency.purchases?.map((p) => (
                        <tr key={p._id}>
                          <td>{p.publisher?.companyName}</td>
                          <td>{p.placement?.name}</td>
                          <td>${p.totalCost?.toLocaleString()}</td>
                          <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3>Audit Trail ({transparency.auditLogs?.length})</h3>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Action</th><th>Entity</th><th>By</th><th>Role</th><th>Date</th></tr></thead>
                    <tbody>
                      {transparency.auditLogs?.map((l) => (
                        <tr key={l._id}>
                          <td><span className="badge badge-draft">{l.action}</span></td>
                          <td>{l.entity}</td>
                          <td>{l.performedBy?.name}</td>
                          <td>{l.role}</td>
                          <td>{new Date(l.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {!transparency.auditLogs?.length && <tr><td colSpan={5} className="empty">No audit logs</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
