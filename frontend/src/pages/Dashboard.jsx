import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const ROLE_LINKS = {
  advertiser: [
    { to: '/campaigns', label: 'Campaigns', icon: '📢', desc: 'Create & manage campaigns', color: '#eff6ff', border: '#2563eb' },
    { to: '/purchases', label: 'Purchases', icon: '🛒', desc: 'Record media purchases', color: '#f0fdf4', border: '#059669' },
    { to: '/reports', label: 'Reports', icon: '📊', desc: 'Review delivery reports', color: '#fefce8', border: '#ca8a04' },
    { to: '/analytics', label: 'Analytics', icon: '📈', desc: 'Campaign performance', color: '#fdf4ff', border: '#7c3aed' },
    { to: '/payments', label: 'Payments', icon: '💳', desc: 'Track payments', color: '#fff7ed', border: '#ea580c' },
    { to: '/blockchain', label: 'Blockchain', icon: '🔗', desc: 'On-chain records', color: '#f0f9ff', border: '#0284c7' },
  ],
  agency: [
    { to: '/agencies', label: 'My Agency', icon: '🏢', desc: 'Manage agency profile', color: '#fdf4ff', border: '#7c3aed' },
    { to: '/publishers', label: 'Publishers', icon: '📰', desc: 'Browse publishers', color: '#f0fdf4', border: '#059669' },
    { to: '/payments', label: 'Payments', icon: '💳', desc: 'Track commissions', color: '#fff7ed', border: '#ea580c' },
  ],
  publisher: [
    { to: '/publishers', label: 'My Profile', icon: '📰', desc: 'Manage placements', color: '#f0fdf4', border: '#059669' },
    { to: '/purchases', label: 'Purchases', icon: '🛒', desc: 'View purchase orders', color: '#eff6ff', border: '#2563eb' },
    { to: '/reports', label: 'Reports', icon: '📊', desc: 'Submit delivery reports', color: '#fefce8', border: '#ca8a04' },
    { to: '/payments', label: 'Payments', icon: '💳', desc: 'Track payments', color: '#fff7ed', border: '#ea580c' },
  ],
  admin: [
    { to: '/campaigns', label: 'Campaigns', icon: '📢', desc: 'Manage all campaigns', color: '#eff6ff', border: '#2563eb' },
    { to: '/purchases', label: 'Purchases', icon: '🛒', desc: 'Approve purchases', color: '#f0fdf4', border: '#059669' },
    { to: '/reports', label: 'Reports', icon: '📊', desc: 'Review reports', color: '#fefce8', border: '#ca8a04' },
    { to: '/payments', label: 'Payments', icon: '💳', desc: 'Process payments', color: '#fff7ed', border: '#ea580c' },
    { to: '/analytics', label: 'Analytics', icon: '📈', desc: 'System analytics', color: '#fdf4ff', border: '#7c3aed' },
    { to: '/blockchain', label: 'Blockchain', icon: '🔗', desc: 'Ledger records', color: '#f0f9ff', border: '#0284c7' },
    { to: '/admin/users', label: 'Users', icon: '👥', desc: 'Manage users', color: '#fef2f2', border: '#dc2626' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: '🗂️', desc: 'System audit trail', color: '#f8fafc', border: '#64748b' },
  ],
};

const ROLE_GREET = {
  advertiser: 'Manage your campaigns and track ad performance.',
  agency: 'Coordinate client campaigns and track commissions.',
  publisher: 'Manage your placements and submit delivery reports.',
  admin: 'Full system overview — manage users, campaigns, and transactions.',
};

const ROLE_COLORS = {
  advertiser: '#2563eb',
  agency: '#7c3aed',
  publisher: '#059669',
  admin: '#dc2626',
};

export default function Dashboard() {
  const { user } = useAuth();
  const links = ROLE_LINKS[user.role] || [];
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user.role === 'advertiser' || user.role === 'admin') {
      Promise.all([
        api.get('/campaigns').catch(() => ({ data: [] })),
        api.get('/purchases').catch(() => ({ data: [] })),
        api.get('/reports').catch(() => ({ data: [] })),
        api.get('/payments').catch(() => ({ data: [] })),
      ]).then(([c, p, r, pay]) => {
        setStats({
          campaigns: c.data.length,
          purchases: p.data.length,
          reports: r.data.length,
          payments: pay.data.length,
        });
      });
    } else if (user.role === 'publisher') {
      Promise.all([
        api.get('/purchases').catch(() => ({ data: [] })),
        api.get('/reports').catch(() => ({ data: [] })),
        api.get('/payments').catch(() => ({ data: [] })),
      ]).then(([p, r, pay]) => {
        setStats({ purchases: p.data.length, reports: r.data.length, payments: pay.data.length });
      });
    } else if (user.role === 'agency') {
      Promise.all([
        api.get('/agencies').catch(() => ({ data: [] })),
        api.get('/payments').catch(() => ({ data: [] })),
      ]).then(([a, pay]) => {
        setStats({ agencies: a.data.length, payments: pay.data.length });
      });
    }
  }, []);

  const STAT_MAP = {
    campaigns: { label: 'Campaigns', icon: '📢', color: '#2563eb' },
    purchases: { label: 'Purchases', icon: '🛒', color: '#059669' },
    reports: { label: 'Reports', icon: '📊', color: '#ca8a04' },
    payments: { label: 'Payments', icon: '💳', color: '#ea580c' },
    agencies: { label: 'Agencies', icon: '🏢', color: '#7c3aed' },
  };

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Hero */}
        <div className="dash-hero">
          <div className="dash-hero-left">
            <div className="dash-avatar" style={{ background: ROLE_COLORS[user.role] }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="dash-welcome">Welcome back, {user.name.split(' ')[0]}!</h1>
              <p className="dash-sub">{ROLE_GREET[user.role]}</p>
            </div>
          </div>
          <span className="dash-role-pill" style={{ background: ROLE_COLORS[user.role] }}>
            {user.role}
          </span>
        </div>

        {/* Stats */}
        {stats && (
          <div className="dash-stats">
            {Object.entries(stats).map(([key, val]) => {
              const s = STAT_MAP[key];
              if (!s) return null;
              return (
                <div className="dash-stat" key={key}>
                  <div className="dash-stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                  <div>
                    <div className="dash-stat-val">{val}</div>
                    <div className="dash-stat-label">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="dash-grid">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="dash-card" style={{ '--card-border': l.border, '--card-bg': l.color }}>
              <div className="dash-card-icon" style={{ background: l.border + '18', color: l.border }}>{l.icon}</div>
              <div className="dash-card-body">
                <strong>{l.label}</strong>
                <span>{l.desc}</span>
              </div>
              <span className="dash-card-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
