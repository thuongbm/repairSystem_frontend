import { Layout, Menu, Input, Avatar, Badge, Dropdown } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  LaptopOutlined,
  DollarOutlined,
  TeamOutlined,
  SearchOutlined,
  BellOutlined,
  ToolOutlined,
  AppstoreOutlined,
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
      label: user?.role === 'customer' ? 'Dịch vụ của tôi' : 'Tổng quan',
      roles: ['admin', 'technician', 'warehouse', 'receptionist', 'customer'],
    },
    {
      key: 'reception',
      icon: <LaptopOutlined />,
      label: 'Lễ tân & Thu ngân',
      roles: ['admin', 'technician', 'receptionist'],
    },
    {
      key: 'technician',
      icon: <ToolOutlined />,
      label: 'Bàn làm việc KTV',
      roles: ['admin', 'technician'],
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Điều phối lịch hẹn',
      roles: ['admin', 'technician', 'receptionist'],
    },
    {
      key: 'warehouse',
      icon: <AppstoreOutlined />,
      label: 'Quản lý kho',
      roles: ['admin', 'warehouse'],
    },
    {
      key: 'pricing',
      icon: <DollarOutlined />,
      label: 'Bảng giá dịch vụ',
      roles: ['admin', 'receptionist'],
    },
    {
      key: 'hr',
      icon: <TeamOutlined />,
      label: 'Quản trị nhân sự',
      roles: ['admin'],
    },
  ];

  const menuItems = user ? allMenuItems.filter((item) => item.roles.includes(user.role)) : allMenuItems;

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
    navigate('/login', { replace: true });
  };

  const userDropdownMenu = {
    items: [
      {
        key: 'user-header',
        label: (
          <div style={{ padding: '4px 2px' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{user?.name || 'Người dùng'}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.roleName || 'Tài khoản'}</div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: 'Đăng xuất',
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        handleLogout();
      }
    },
  };

  const currentMenu = allMenuItems.find((item) => item.key === getSelectedKey());

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={240}
        className="layout-sidebar"
      >
        <div className="layout-sidebar-logo">
          <div
            style={{
              width: '28px',
              height: '28px',
              background: '#2563eb',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '-0.5px'
            }}
          >
            TF
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
              TechFix
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, letterSpacing: '0.02em' }}>
              Service OS
            </span>
          </div>
        </div>

        <div style={{ padding: '12px 14px 4px 14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Phân hệ làm việc
          </span>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems.map((item) => ({ key: item.key, icon: item.icon, label: item.label }))}
          className="layout-sidebar-menu"
        />

        <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981'
                }}
              />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Hệ thống trực tuyến
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
              v2.4
            </span>
          </div>
        </div>
      </Sider>

      <Layout style={{ background: '#f8fafc' }}>
        <Header className="layout-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
              {currentMenu?.label || 'Tổng quan'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Input
              placeholder="Tìm kiếm mã phiếu, SĐT..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              className="header-search-input"
            />

            <Badge dot color="#2563eb" offset={[-2, 2]}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <BellOutlined style={{ fontSize: '15px' }} />
              </div>
            </Badge>

            <Dropdown menu={userDropdownMenu} trigger={['click']} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff'
                }}
              >
                <Avatar
                  size={26}
                  style={{ backgroundColor: '#2563eb', fontSize: '12px', fontWeight: 600 }}
                  icon={<UserOutlined />}
                >
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : null}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column' }} className="mobile-hide">
                  <span style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a', lineHeight: 1.2 }}>
                    {user?.name || 'Mỹ Linh'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.1 }}>
                    {user?.roleName || 'Quản trị viên'}
                  </span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="layout-content-wrapper">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
