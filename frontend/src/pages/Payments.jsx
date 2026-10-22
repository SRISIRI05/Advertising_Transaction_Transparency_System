import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);

  const load = () => api.get('/payments').then((r) => setPayments(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, field, status) => {
    await api.patch(`/payments/${id}/status`, { [field]: status });
    load();
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header"><h2>Payments</h2></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th><th>Publisher</th><th>Agency</th>
                <th>Publisher Amt</th><th>Agency Commission</th><th>Total</th>
                <th>Publisher Status</th><th>Agency Status</th>
                {user.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>{p.campaign?.title}</td>
                  <td>{p.publisher?.companyName}</td>
                  <td>{p.agency?.companyName || '—'}</td>
                  <td>${p.publisherAmount?.toLocaleString()}</td>
                  <td>${p.agencyCommission?.toLocaleString()}</td>
                  <td>${p.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${p.publisherStatus === 'paid' ? 'badge-active' : 'badge-draft'}`}>
                      {p.publisherStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.agencyStatus === 'paid' ? 'badge-active' : p.agencyStatus === 'not_applicable' ? 'badge-cancelled' : 'badge-draft'}`}>
                      {p.agencyStatus}
                    </span>
                  </td>
                  {user.role === 'admin' && (
                    <td>
                      {p.publisherStatus === 'pending' && (
                        <button className="btn-sm" onClick={() => handleStatus(p._id, 'publisherStatus', 'paid')}>
                          Mark Publisher Paid
                        </button>
                      )}
                      {p.agencyStatus === 'pending' && (
                        <button className="btn-sm" onClick={() => handleStatus(p._id, 'agencyStatus', 'paid')}>
                          Mark Agency Paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={9} className="empty">No payments</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
