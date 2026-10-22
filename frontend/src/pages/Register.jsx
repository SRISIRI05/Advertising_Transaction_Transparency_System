import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'advertiser', label: 'Advertiser', icon: '📢', desc: 'Run ad campaigns' },
  { value: 'agency', label: 'Agency', icon: '🏢', desc: 'Manage client campaigns' },
  { value: 'publisher', label: 'Publisher', icon: '📰', desc: 'Sell ad placements' },
  { value: 'admin', label: 'Admin', icon: '🛡️', desc: 'Full system access' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'advertiser' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">ATTS</div>
          <h1>Advertising Transaction Transparency System</h1>
          <p>Blockchain-powered ad transparency for advertisers, agencies, and publishers.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <h2>Create account</h2>
          <p className="auth-sub">Get started for free</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input placeholder="John Smith" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="field">
              <label>I am a...</label>
              <div className="role-cards-vertical">
                {ROLES.map((r) => (
                  <div key={r.value}
                    className={`role-card-v ${form.role === r.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, role: r.value })}>
                    <div className="role-card-v-left">
                      <span className="role-icon">{r.icon}</span>
                      <div>
                        <strong>{r.label}</strong>
                        <p>{r.desc}</p>
                      </div>
                    </div>
                    <div className={`role-radio ${form.role === r.value ? 'checked' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
