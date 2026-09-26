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
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Điều phối lịch hẹn',
    },
    {
      key: 'reception',
      icon: <LaptopOutlined />,
      label: 'Tiếp nhận máy',
    },
    {
      key: 'pricing',
      icon: <DollarOutlined />,
      label: 'Bảng giá dịch vụ',
    },
    {
      key: 'hr',
      icon: <TeamOutlined />,
      label: 'Quản trị nhân sự',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'dashboard') navigate('/');
    else navigate(`/${key}`);
  };

  const getSelectedKey = () => {
    const path = location.pathname.substring(1);
    return path === '' ? 'dashboard' : path;
  };

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
          ĐIỀU HÀNH
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
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
             <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{menuItems.find(item => item.key === getSelectedKey())?.label}</h2>
             <span style={{ color: '#8c8c8c', fontSize: '13px' }}>Hệ thống quản lý bảo trì & sửa chữa</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Input 
              placeholder="Tìm mã phiếu hoặc số điện thoại..." 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: 320, borderRadius: '20px', padding: '8px 16px', background: '#f5f5f5', border: 'none' }}
            />
            <Badge dot color="red" offset={[-2, 4]}>
              <BellOutlined style={{ fontSize: '20px', color: '#595959', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: [{ key: 'logout', label: 'Đăng xuất' }] }} trigger={['click']}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff' }}>TML</Avatar>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.2' }}>Mỹ Linh</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Quản lý</div>
                </div>
              </Space>
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
