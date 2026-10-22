import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_DESCRIPTION = {
  advertiser: 'Manage your campaigns and track spending.',
  agency: 'Manage client campaigns and media purchases.',
  publisher: 'View placements and delivery reports.',
  admin: 'Manage all users, campaigns, and system settings.',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header>
        <h1>ATTS Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <div className="dashboard-body">
        <h2>Welcome, {user.name}</h2>
        <span className="role-badge">{user.role}</span>
        <p>{ROLE_DESCRIPTION[user.role]}</p>
      </div>
    </div>
  );
}
