import React from 'react';
import { Card, Button, Typography, Space, Row, Col, Layout } from 'antd';
import { UserOutlined, SettingOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Content } = Layout;

const roles = [
  {
    id: 'admin',
    name: 'Quản trị viên (Admin)',
    icon: <SettingOutlined style={{ fontSize: '32px', color: '#f5222d' }} />,
    color: '#fff1f0',
    borderColor: '#ffa39e',
    user: { name: 'Mỹ Linh', role: 'admin', roleName: 'Quản trị viên' }
  },
  {
    id: 'technician',
    name: 'Kỹ thuật viên',
    icon: <ToolOutlined style={{ fontSize: '32px', color: '#1677ff' }} />,
    color: '#e6f4ff',
    borderColor: '#91caff',
    user: { name: 'Tuấn Anh', role: 'technician', roleName: 'Kỹ thuật viên' }
  },

  {
    id: 'warehouse',
    name: 'Thủ kho',
    icon: <ShopOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
    color: '#f6ffed',
    borderColor: '#b7eb8f',
    user: { name: 'Hải Yến', role: 'warehouse', roleName: 'Thủ kho' }
  },
  {
    id: 'customer',
    name: 'Khách hàng',
    icon: <UserOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
    color: '#f9f0ff',
    borderColor: '#d3adf7',
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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card style={{ width: 600, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: '48px', height: '48px', background: '#1677ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>🔧</span>
          </div>
          <Title level={3} style={{ margin: 0 }}>TechFix - Đăng nhập</Title>
          <Text type="secondary">Vui lòng chọn vai trò để đăng nhập vào hệ thống</Text>
        </div>

        <Row gutter={[16, 16]}>
          {roles.map((role) => (
            <Col span={12} key={role.id}>
              <Card 
                hoverable
                onClick={() => handleLogin(role.user)}
                style={{ 
                  background: role.color, 
                  borderColor: role.borderColor,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '24px 16px' }}
              >
                <div style={{ marginBottom: 16 }}>
                  {role.icon}
                </div>
                <Title level={5} style={{ margin: 0 }}>{role.name}</Title>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Layout>
  );
};

export default Login;
