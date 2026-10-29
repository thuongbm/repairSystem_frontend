import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Layout, Alert, Divider, Space, Tag, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const { Title, Text } = Typography;

// Ánh xạ vai trò từ Backend (chữ HOA) sang vai trò điều hướng Frontend (chữ thường)
const mapBackendRole = (vaiTro) => {
  switch ((vaiTro || '').toUpperCase()) {
    case 'ADMIN':
      return { role: 'admin', roleName: 'Quản trị viên' };
    case 'KY_THUAT_VIEN':
      return { role: 'technician', roleName: 'Kỹ thuật viên' };
    case 'THU_KHO':
      return { role: 'warehouse', roleName: 'Thủ kho' };
    case 'LE_TAN':
      return { role: 'receptionist', roleName: 'Lễ tân' };
    case 'KHACH_HANG':
    default:
      return { role: 'customer', roleName: 'Khách hàng' };
  }
};

const quickAccounts = [
  { label: 'Admin', username: 'admin', roleTag: 'red' },
  { label: 'Lễ tân', username: 'letan01', roleTag: 'blue' },
  { label: 'Thủ kho', username: 'thukho01', roleTag: 'green' },
  { label: 'Kỹ thuật viên', username: 'ktv01', roleTag: 'orange' },
];

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(values.username.trim(), values.password);

      // Bóc tách dữ liệu phản hồi (hỗ trợ cả response bọc ApiResponse hoặc trực tiếp)
      const payload = res?.data?.data || res?.data || res;
      const token = payload?.token?.accessToken || res?.token?.accessToken;
      const rawUser = payload?.user || res?.user;

      if (!token || !rawUser) {
        throw new Error('Không nhận được thông tin xác thực từ máy chủ.');
      }

      // Chuẩn hóa role và thông tin người dùng cho Frontend
      const { role, roleName } = mapBackendRole(rawUser.vaiTro);
      const userProfile = {
        id: rawUser.taiKhoanId,
        name: rawUser.tenDangNhap,
        username: rawUser.tenDangNhap,
        vaiTro: rawUser.vaiTro,
        role,
        roleName,
      };

      // Lưu vào Context và localStorage
      login(userProfile, token);

      message.success(`Đăng nhập thành công! Chào mừng ${userProfile.name} (${roleName}).`);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.';
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (acc) => {
    form.setFieldsValue({
      username: acc.username,
      password: 'Password@123', // Mật khẩu mẫu gợi ý
    });
    setErrorMessage('');
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: 440,
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        bodyStyle={{ padding: '36px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#1677ff',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(22,119,255,0.3)',
            }}
          >
            <span style={{ fontSize: '28px' }}>🔧</span>
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            TechFix System
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Hệ thống quản lý dịch vụ sửa chữa thiết bị
          </Text>
        </div>

        {errorMessage && (
          <Alert
            message="Lỗi đăng nhập"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage('')}
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          form={form}
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: '', password: '' }}
          requiredMark={false}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="Ví dụ: admin, letan01..."
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="Nhập mật khẩu"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '20px 0 16px', fontSize: '12px', color: '#8c8c8c' }}>
          Tài khoản mẫu thử nghiệm
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Space wrap size={[8, 8]} style={{ justifyContent: 'center' }}>
            {quickAccounts.map((acc) => (
              <Tag
                key={acc.username}
                color={acc.roleTag}
                style={{
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '12px',
                }}
                onClick={() => handleQuickFill(acc)}
              >
                {acc.label}: <strong>{acc.username}</strong>
              </Tag>
            ))}
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              💡 Nhấn vào thẻ vai trò để điền nhanh tên tài khoản
            </Text>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default Login;
