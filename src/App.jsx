import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Reception from './pages/Reception';
import Pricing from './pages/Pricing';
import HR from './pages/HR';
import Login from './pages/Login';
import Warehouse from './pages/Warehouse';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Everyone can access Dashboard */}
              <Route index element={<Dashboard />} />
              
              {/* Admin and Technician */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'technician']} />}>
                <Route path="appointments" element={<Appointments />} />
                <Route path="reception" element={<Reception />} />
              </Route>

              {/* Admin and Warehouse */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
                <Route path="warehouse" element={<Warehouse />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="pricing" element={<Pricing />} />
                <Route path="hr" element={<HR />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;