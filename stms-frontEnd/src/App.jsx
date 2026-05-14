import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import SetPassword from './pages/auth/SetPassword';
import OAuthCallback from './pages/auth/OAuthCallback';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import Buses from './pages/admin/Buses';
import Drivers from './pages/admin/Drivers';
import RoutesPage from './pages/admin/RoutesPage';
import Students from './pages/admin/Students';
import Schedules from './pages/admin/Schedules';
import Announcements from './pages/admin/Announcements';
import Locations from './pages/admin/Locations';
import DriverDashboard from './pages/driver/DriverDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" />;
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="buses" element={<Buses />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="students" element={<Students />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="locations" element={<Locations />} />
          </Route>

          <Route
            path="/driver/*"
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'PARENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;