import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ entity: '', action: '' });

  const load = () => {
    const params = new URLSearchParams();
    if (filters.entity) params.append('entity', filters.entity);
    if (filters.action) params.append('action', filters.action);
    api.get(`/analytics/audit-logs?${params}`).then((r) => setLogs(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header"><h2>Audit Logs</h2></div>

        <div className="card" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input placeholder="Filter by entity (Campaign, MediaPurchase...)" value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })} style={{ flex: 1 }} />
          <input placeholder="Filter by action (CREATE, UPDATE...)" value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })} style={{ flex: 1 }} />
          <button onClick={load}>Apply</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Action</th><th>Entity</th><th>Entity ID</th><th>Performed By</th><th>Role</th><th>IP</th><th>Date</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td><span className="badge badge-draft">{l.action}</span></td>
                  <td>{l.entity}</td>
                  <td className="hash">{l.entityId}</td>
                  <td>{l.performedBy?.name}</td>
                  <td>{l.role}</td>
                  <td>{l.ipAddress}</td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={7} className="empty">No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
