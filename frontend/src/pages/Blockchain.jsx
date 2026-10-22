import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Blockchain() {
  const [transactions, setTransactions] = useState([]);
  const [verifyForm, setVerifyForm] = useState({ recordId: '', data: '' });
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/blockchain').then((r) => setTransactions(r.data)).catch(() => {});
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyResult(null);
    try {
      const data = JSON.parse(verifyForm.data);
      const { data: result } = await api.post('/blockchain/verify', { recordId: verifyForm.recordId, data });
      setVerifyResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid JSON or verification failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header"><h2>Blockchain Ledger</h2></div>

        <div className="card form-card" style={{ marginBottom: '1.5rem' }}>
          <h3>Verify Record</h3>
          <form onSubmit={handleVerify}>
            {error && <p className="error">{error}</p>}
            <input placeholder="Record ID (MongoDB ObjectId)" value={verifyForm.recordId}
              onChange={(e) => setVerifyForm({ ...verifyForm, recordId: e.target.value })} required />
            <textarea placeholder='Record data as JSON e.g. {"title":"..."}' rows={3}
              value={verifyForm.data} onChange={(e) => setVerifyForm({ ...verifyForm, data: e.target.value })} required />
            <div className="form-actions"><button type="submit">Verify</button></div>
          </form>
          {verifyResult && (
            <div className={`verify-result ${verifyResult.isValid ? 'valid' : 'invalid'}`}>
              <strong>{verifyResult.isValid ? '✓ Valid — Record not tampered' : '✗ Invalid — Hash mismatch detected'}</strong>
              <div>Source: {verifyResult.source}</div>
              <div className="hash">Computed: {verifyResult.computedHash}</div>
              {verifyResult.storedHash && <div className="hash">Stored: {verifyResult.storedHash}</div>}
            </div>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Type</th><th>Record ID</th><th>Tx Hash</th><th>Block</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td><span className="badge badge-draft">{t.recordType}</span></td>
                  <td className="hash">{t.recordId}</td>
                  <td className="hash">{t.txHash || '—'}</td>
                  <td>{t.blockNumber || '—'}</td>
                  <td><span className={`badge ${t.status === 'confirmed' ? 'badge-active' : t.status === 'failed' ? 'badge-cancelled' : 'badge-draft'}`}>{t.status}</span></td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} className="empty">No transactions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
