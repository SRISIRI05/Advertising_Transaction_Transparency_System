import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Agencies from './pages/Agencies';
import Publishers from './pages/Publishers';
import PublisherDetail from './pages/PublisherDetail';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import Blockchain from './pages/Blockchain';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute roles={['advertiser', 'admin']}><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/agencies" element={<ProtectedRoute><Agencies /></ProtectedRoute>} />
          <Route path="/publishers" element={<ProtectedRoute><Publishers /></ProtectedRoute>} />
          <Route path="/publishers/:id" element={<ProtectedRoute><PublisherDetail /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/blockchain" element={<ProtectedRoute roles={['advertiser', 'admin']}><Blockchain /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute roles={['advertiser', 'admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/analytics/:campaignId" element={<ProtectedRoute roles={['advertiser', 'admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
