import { Card, Typography, Row, Col, Layout } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  ShopOutlined, 
  ToolOutlined, 
  CustomerServiceOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const roles = [
  {
    id: 'admin',
    name: 'Quản trị viên (Admin)',
    description: 'Toàn quyền cấu hình hệ thống & báo cáo',
    icon: <SettingOutlined style={{ fontSize: '20px', color: '#0f172a' }} />,
    user: { name: 'Mỹ Linh', role: 'admin', roleName: 'Quản trị viên' }
  },
  {
    id: 'receptionist',
    name: 'Lễ tân / Thu ngân',
    description: 'Tiếp nhận thiết bị, thu ngân, giao ca',
    icon: <CustomerServiceOutlined style={{ fontSize: '20px', color: '#2563eb' }} />,
    user: { name: 'Thanh Thảo', role: 'receptionist', roleName: 'Lễ tân / Thu ngân' }
  },
  {
    id: 'technician',
    name: 'Kỹ thuật viên',
    description: 'Chẩn đoán phần cứng, linh kiện & sửa chữa',
    icon: <ToolOutlined style={{ fontSize: '20px', color: '#059669' }} />,
    user: { name: 'Tuấn Anh', role: 'technician', roleName: 'Kỹ thuật viên' }
  },
  {
    id: 'warehouse',
    name: 'Thủ kho',
    description: 'Quản lý tồn kho, duyệt xuất & nhập vật tư',
    icon: <ShopOutlined style={{ fontSize: '20px', color: '#d97706' }} />,
    user: { name: 'Hải Yến', role: 'warehouse', roleName: 'Thủ kho' }
  },
  {
    id: 'customer',
    name: 'Khách hàng',
    description: 'Tra cứu tiến độ & kiểm tra lịch sử máy',
    icon: <UserOutlined style={{ fontSize: '20px', color: '#7c3aed' }} />,
    user: { name: 'Văn Nam', role: 'customer', roleName: 'Khách hàng' }
  }
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = (user) => {
    login(user);
    navigate(from, { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#2563eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '18px',
              margin: '0 auto 14px'
            }}
          >
            TF
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            TechFix Platform
          </Title>
          <Text style={{ color: '#64748b', fontSize: '13px' }}>
            Chọn vai trò truy cập để chuyển vào workspace làm việc
          </Text>
        </div>

        <Card style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <Row gutter={[12, 12]}>
            {roles.map((role) => (
              <Col xs={24} sm={12} key={role.id}>
                <div
                  onClick={() => handleLogin(role.user)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: '#ffffff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {role.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                        {role.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {role.description}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
