import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, Badge, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  LaptopOutlined,
  DollarOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const allMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      roles: ['admin', 'technician', 'warehouse', 'customer']
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Điều phối lịch hẹn',
      roles: ['admin', 'technician']
    },
    {
      key: 'reception',
      icon: <LaptopOutlined />,
      label: 'Tiếp nhận máy',
      roles: ['admin', 'technician']
    },
    {
      key: 'pricing',
      icon: <DollarOutlined />,
      label: 'Bảng giá dịch vụ',
      roles: ['admin']
    },
    {
      key: 'hr',
      icon: <TeamOutlined />,
      label: 'Quản trị nhân sự',
      roles: ['admin']
    },
  ];

  // Filter menu items based on current user's role
  const menuItems = allMenuItems.filter(item => user && item.roles.includes(user.role));

  const handleMenuClick = ({ key }) => {
    if (key === 'dashboard') navigate('/');
    else navigate(`/${key}`);
  };

  const getSelectedKey = () => {
    const path = location.pathname.substring(1);
    return path === '' ? 'dashboard' : path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  if (!user) return null; // Or some loading state, handled by ProtectedRoute though

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={250} 
        style={{ 
          background: '#1a2235', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <div style={{ padding: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#1677ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🔧</span>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}>TechFix</div>
            <div style={{ fontSize: '12px', color: '#8a94a6' }}>Service Management</div>
          </div>
        </div>

        <div style={{ padding: '0 20px', color: '#8a94a6', fontSize: '12px', marginTop: '10px', marginBottom: '10px', fontWeight: '500' }}>
          CHỨC NĂNG ({user.roleName.toUpperCase()})
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems.map(item => ({ key: item.key, icon: item.icon, label: item.label }))}
          style={{ background: '#1a2235', flex: 1, borderRight: 0 }}
        />

        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <div style={{ background: '#252e42', padding: '15px', borderRadius: '8px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
               <QuestionCircleOutlined />
               <span style={{ fontWeight: '500' }}>Cần hỗ trợ?</span>
            </div>
            <div style={{ fontSize: '12px', color: '#8a94a6' }}>Liên hệ đội kỹ thuật nội bộ để được hướng dẫn sử dụng hệ thống.</div>
          </div>
        </div>
      </Sider>
      
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', height: '70px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
             <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{menuItems.find(item => item.key === getSelectedKey())?.label || 'Tổng quan'}</h2>
             <span style={{ color: '#8c8c8c', fontSize: '13px' }}>Hệ thống quản lý bảo trì & sửa chữa</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', lineHeight: 'normal' }}>
            <Input 
              placeholder="Tìm mã phiếu hoặc số điện thoại..." 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: 320, borderRadius: '20px', padding: '8px 16px', background: '#f5f5f5', border: 'none' }}
            />
            <Badge dot color="red">
              <BellOutlined style={{ fontSize: '20px', color: '#595959', cursor: 'pointer', display: 'block' }} />
            </Badge>
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: user.role === 'admin' ? '#f5222d' : (user.role === 'technician' ? '#1677ff' : (user.role === 'warehouse' ? '#52c41a' : '#722ed1')) }} icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.2' }}>{user.name}</span>
                  <span style={{ fontSize: '12px', color: '#8c8c8c', lineHeight: '1.2' }}>{user.roleName}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', background: 'transparent' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

