import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Trainers from './pages/Trainers';
import Analytics from './pages/Analytics';
import Moderation from './pages/Moderation';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00ffff', // Electric Cyan - Rezzmo brand color
          borderRadius: 8,
          colorLink: '#0891b2', // Deep Cyan for links
        },
      }}
    >
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="moderation" element={<Moderation />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
