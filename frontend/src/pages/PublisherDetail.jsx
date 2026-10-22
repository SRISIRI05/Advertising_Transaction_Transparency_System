import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const TYPES = ['banner', 'video', 'native', 'popup', 'sponsored'];
const UNIT_TYPES = ['CPM', 'CPC', 'CPD', 'flat'];
const EMPTY = { name: '', type: 'banner', platform: '', unitType: 'CPM', pricePerUnit: '', availableInventory: '' };

export default function PublisherDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [publisher, setPublisher] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get(`/publishers/${id}`).then((r) => setPublisher(r.data));
  useEffect(() => { load(); }, [id]);

  const isOwner = publisher && (publisher.user?._id === user._id || publisher.user === user._id);
  const canManage = user.role === 'admin' || isOwner;

  const handleAddPlacement = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/publishers/${id}/placements`, {
        ...form,
        pricePerUnit: Number(form.pricePerUnit),
        availableInventory: Number(form.availableInventory),
      });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (placementId) => {
    await api.delete(`/publishers/${id}/placements/${placementId}`);
    load();
  };

  if (!publisher) return <><Navbar /><div className="page">Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>{publisher.companyName}</h2>
          {canManage && <button onClick={() => setShowForm(!showForm)}>+ Add Placement</button>}
        </div>

        <div className="card">
          <div className="detail-grid">
            <div><label>Category</label><span>{publisher.audienceCategory}</span></div>
            <div><label>Website</label><a href={publisher.website} target="_blank" rel="noreferrer">{publisher.website}</a></div>
            <div><label>Verified</label><span className={`badge ${publisher.isVerified ? 'badge-active' : 'badge-draft'}`}>{publisher.isVerified ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {showForm && (
          <form className="card form-card" onSubmit={handleAddPlacement}>
            <h3>Add Placement</h3>
            {error && <p className="error">{error}</p>}
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Platform (e.g. web, mobile)" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
            <select value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })}>
              {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" placeholder="Price Per Unit" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} required />
            <input type="number" placeholder="Available Inventory" value={form.availableInventory} onChange={(e) => setForm({ ...form, availableInventory: e.target.value })} required />
            <div className="form-actions">
              <button type="submit">Add</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <h3>Placements ({publisher.placements?.length || 0})</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Platform</th><th>Unit</th><th>Price</th><th>Inventory</th><th>Active</th>{canManage && <th>Action</th>}</tr></thead>
            <tbody>
              {publisher.placements?.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.type}</td>
                  <td>{p.platform}</td>
                  <td>{p.unitType}</td>
                  <td>${p.pricePerUnit}</td>
                  <td>{p.availableInventory}</td>
                  <td><span className={`badge ${p.isActive ? 'badge-active' : 'badge-cancelled'}`}>{p.isActive ? 'Yes' : 'No'}</span></td>
                  {canManage && <td><button className="btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Remove</button></td>}
                </tr>
              ))}
              {!publisher.placements?.length && <tr><td colSpan={8} className="empty">No placements</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
