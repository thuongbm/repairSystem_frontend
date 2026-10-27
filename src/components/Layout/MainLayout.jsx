import { Layout, Menu, Input, Avatar, Badge, Dropdown } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  LaptopOutlined,
  DollarOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
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
      label: 'Quản lý kho vật tư',
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

  // Lọc menu theo vai trò người dùng
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f5222d';
      case 'receptionist':
        return '#fa8c16';
      case 'technician':
        return '#1677ff';
      case 'warehouse':
        return '#52c41a';
      case 'customer':
        return '#722ed1';
      default:
        return '#1677ff';
    }
  };

  const userDropdownMenu = {
    items: [
      {
        key: 'user-header',
        label: (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontWeight: '600', color: '#262626' }}>{user?.name || 'Người dùng'}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user?.roleName || 'Tài khoản'}</div>
          </div>
        ),
        disabled: true,
      },
      {
        type: 'divider',
      },
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
        style={{
          background: '#1a2235',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#1677ff',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🔧</span>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}>TechFix</div>
            <div style={{ fontSize: '12px', color: '#8a94a6' }}>Service Management</div>
          </div>
        </div>

        <div
          style={{
            padding: '0 20px',
            color: '#8a94a6',
            fontSize: '12px',
            marginTop: '10px',
            marginBottom: '10px',
            fontWeight: '500',
            letterSpacing: '0.5px',
          }}
        >
          {user?.roleName ? `CHỨC NĂNG (${user.roleName.toUpperCase()})` : 'ĐIỀU HÀNH'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems.map((item) => ({ key: item.key, icon: item.icon, label: item.label }))}
          style={{ background: '#1a2235', flex: 1, borderRight: 0 }}
        />

        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <div style={{ background: '#252e42', padding: '15px', borderRadius: '8px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <QuestionCircleOutlined />
              <span style={{ fontWeight: '500' }}>Cần hỗ trợ?</span>
            </div>
            <div style={{ fontSize: '12px', color: '#8a94a6' }}>
              Liên hệ đội kỹ thuật nội bộ để được hướng dẫn sử dụng hệ thống.
            </div>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            height: '70px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              {allMenuItems.find((item) => item.key === getSelectedKey())?.label || 'Tổng quan'}
            </h2>
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

            <Dropdown menu={userDropdownMenu} trigger={['click']} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
              >
                <Avatar style={{ backgroundColor: getRoleBadgeColor(user?.role) }} icon={<UserOutlined />}>
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : null}
                </Avatar>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.2' }}>
                    {user?.name || 'Mỹ Linh'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#8c8c8c', lineHeight: '1.2' }}>
                    {user?.roleName || 'Quản trị viên'}
                  </span>
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
