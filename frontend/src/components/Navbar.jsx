import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const NAV_ITEMS = {
  advertiser: [
    { to: '/campaigns', label: 'Campaigns', icon: '📢' },
    { to: '/purchases', label: 'Purchases', icon: '🛒' },
    { to: '/reports', label: 'Reports', icon: '📊' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/payments', label: 'Payments', icon: '💳' },
    { to: '/agencies', label: 'Agencies', icon: '🏢' },
    { to: '/publishers', label: 'Publishers', icon: '📰' },
    { to: '/blockchain', label: 'Blockchain', icon: '🔗' },
  ],
  agency: [
    { to: '/agencies', label: 'My Agency', icon: '🏢' },
    { to: '/publishers', label: 'Publishers', icon: '📰' },
    { to: '/payments', label: 'Payments', icon: '💳' },
  ],
  publisher: [
    { to: '/publishers', label: 'My Profile', icon: '📰' },
    { to: '/purchases', label: 'Purchases', icon: '🛒' },
    { to: '/reports', label: 'Reports', icon: '📊' },
    { to: '/payments', label: 'Payments', icon: '💳' },
  ],
  admin: [
    { to: '/campaigns', label: 'Campaigns', icon: '📢' },
    { to: '/purchases', label: 'Purchases', icon: '🛒' },
    { to: '/reports', label: 'Reports', icon: '📊' },
    { to: '/payments', label: 'Payments', icon: '💳' },
    { to: '/agencies', label: 'Agencies', icon: '🏢' },
    { to: '/publishers', label: 'Publishers', icon: '📰' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/blockchain', label: 'Blockchain', icon: '🔗' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: '🗂️' },
  ],
};

const ROLE_COLORS = {
  advertiser: '#2563eb',
  agency: '#7c3aed',
  publisher: '#059669',
  admin: '#dc2626',
};

const ROLE_ICONS = {
  advertiser: '📢',
  agency: '🏢',
  publisher: '📰',
  admin: '🛡️',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV_ITEMS[user.role] || [];
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-logo">ATTS</span>
          <span className="navbar-tagline">Ad Transparency</span>
        </Link>

        <div className="navbar-center">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-right" ref={dropdownRef}>
          <div className="nav-profile" onClick={() => setOpen(!open)}>
            <div className="nav-avatar" style={{ background: ROLE_COLORS[user.role] }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="nav-user-text">
              <span className="nav-user-name">{user.name}</span>
              <span className="nav-user-role" style={{ color: ROLE_COLORS[user.role] }}>{user.role}</span>
            </div>
            <span className="nav-chevron" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>

          {open && (
            <div className="profile-dropdown">
              {/* Header */}
              <div className="pd-header" style={{ borderTop: `3px solid ${ROLE_COLORS[user.role]}` }}>
                <div className="pd-avatar" style={{ background: ROLE_COLORS[user.role] }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="pd-name">{user.name}</div>
                  <div className="pd-email">{user.email}</div>
                </div>
              </div>

              {/* Details */}
              <div className="pd-body">
                <div className="pd-row">
                  <span className="pd-label">Role</span>
                  <span className="pd-value">
                    <span className="pd-role-pill" style={{ background: ROLE_COLORS[user.role] + '18', color: ROLE_COLORS[user.role], border: `1px solid ${ROLE_COLORS[user.role]}40` }}>
                      {ROLE_ICONS[user.role]} {user.role}
                    </span>
                  </span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">User ID</span>
                  <span className="pd-value pd-id">{user._id || user.id}</span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Status</span>
                  <span className="pd-value">
                    <span className="pd-status-dot" />Active
                  </span>
                </div>
              </div>

              <div className="pd-divider" />

              <button className="pd-logout" onClick={handleLogout}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
