import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Reception from './pages/Reception';
import Pricing from './pages/Pricing';
import HR from './pages/HR';
import Login from './pages/Login';
import Warehouse from './pages/Warehouse';
import Technician from './pages/Technician';
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
              {/* Home determines whether to show Dashboard or CustomerPortal */}
              <Route index element={<Home />} />
              
              {/* Admin, Technician and Receptionist */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'technician', 'receptionist']} />}>
                <Route path="reception" element={<Reception />} />
                <Route path="appointments" element={<Appointments />} />
              </Route>

              {/* Admin and Technician */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'technician']} />}>
                <Route path="technician" element={<Technician />} />
              </Route>

              {/* Admin and Warehouse */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
                <Route path="warehouse" element={<Warehouse />} />
              </Route>

              {/* Admin and Receptionist */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
                <Route path="pricing" element={<Pricing />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
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
