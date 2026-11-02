import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import CustomerPortal from './pages/CustomerPortal';
import Dashboard from './pages/Dashboard';
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
          {/* CỔNG KHÁCH HÀNG: Công khai cho mọi người truy cập */}
          <Route path="/" element={<CustomerPortal />} />

          {/* CỔNG ĐĂNG NHẬP & ĐĂNG KÝ */}
          <Route path="/login" element={<Login />} />

          {/* CỔNG QUẢN TRỊ & NGHIỆP VỤ NHÂN SỰ */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'technician', 'warehouse', 'receptionist']} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Lễ tân, Kỹ thuật viên & Quản trị viên */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'technician', 'receptionist']} />}>
                <Route path="/reception" element={<Reception />} />
                <Route path="/appointments" element={<Appointments />} />
              </Route>

              {/* Kỹ thuật viên & Quản trị viên */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'technician']} />}>
                <Route path="/technician" element={<Technician />} />
              </Route>

              {/* Thủ kho & Quản trị viên */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
                <Route path="/warehouse" element={<Warehouse />} />
              </Route>

              {/* Bảng giá dịch vụ */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
                <Route path="/pricing" element={<Pricing />} />
              </Route>

              {/* Quản trị nhân sự (Chỉ Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/hr" element={<HR />} />
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
