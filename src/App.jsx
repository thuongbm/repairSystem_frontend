import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';
import './App.css';

const CustomerPortal = lazy(() => import('./features/customer/CustomerPortalPage'));
const Dashboard = lazy(() => import('./features/dashboard/DashboardPage'));
const FinancialReconciliation = lazy(() => import('./features/dashboard/FinancialReconciliationPage'));
const Reception = lazy(() => import('./features/reception/ReceptionPage'));
const Pricing = lazy(() => import('./features/catalog/PricingPage'));
const HR = lazy(() => import('./features/staff/StaffPage'));
const Login = lazy(() => import('./features/auth/LoginPage'));
const Warehouse = lazy(() => import('./features/inventory/WarehousePage'));
const Technician = lazy(() => import('./features/repair/TechnicianPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div role="status" className="app-loading">Đang tải giao diện…</div>}>
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
              <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
                <Route path="/reception" element={<Reception />} />
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
                <Route path="/finance" element={<FinancialReconciliation />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
