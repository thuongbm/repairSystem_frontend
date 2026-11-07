import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Layout, Alert, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { api } from '../../services/api';

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

const LoginPage = () => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerError, setRegisterError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  // Xử lý đăng nhập
  const onLoginFinish = async (values) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(values.username.trim(), values.password);

      const payload = res?.data?.data || res?.data || res;
      const token = payload?.token?.accessToken || res?.token?.accessToken;
      const rawUser = payload?.user || res?.user;

      if (!token || !rawUser) {
        throw new Error('Không nhận được thông tin xác thực từ máy chủ.');
      }

      const { role, roleName } = mapBackendRole(rawUser.vaiTro);
      const userProfile = {
        id: rawUser.taiKhoanId,
        name: rawUser.tenDangNhap,
        username: rawUser.tenDangNhap,
        vaiTro: rawUser.vaiTro,
        role,
        roleName,
      };

      login(userProfile, token);

      message.success(`Đăng nhập thành công! Chào mừng ${userProfile.name} (${roleName}).`);
      
      // Nếu là khách hàng thì về trang chủ dịch vụ, nếu là nhân sự thì vào bảng điều khiển nội bộ
      if (role === 'customer') {
        navigate(location.state?.returnToBooking ? '/?tab=appointments' : '/', { replace: true });
      } else {
        const dest = from !== '/' && from !== '/login' ? from : '/dashboard';
        navigate(dest, { replace: true });
      }
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

  // Xử lý đăng ký tài khoản khách hàng mới
  const onRegisterFinish = async (values) => {
    setRegisterLoading(true);
    setRegisterError('');

    try {
      const payload = {
        username: values.reg_username.trim(),
        password: values.reg_password,
        confirmPassword: values.reg_confirmPassword,
        hoTen: values.reg_hoTen.trim(),
        soDienThoai: values.reg_soDienThoai.trim(),
        email: values.reg_email ? values.reg_email.trim() : null,
        maLienKet: values.reg_maLienKet?.trim() || null,
      };

      const res = await api.register(payload);
      message.success(res?.message || 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
      
      // Chuyển sang tab đăng nhập và điền sẵn username
      setActiveTab('login');
      loginForm.setFieldsValue({
        username: values.reg_username.trim(),
        password: values.reg_password,
      });
      registerForm.resetFields();
    } catch (err) {
      console.error('Register error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setRegisterError(serverMsg);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Nút quay lại trang chủ khách hàng */}
        <div style={{ marginBottom: 16 }}>
          <Link
            to="/"
            style={{
              color: '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '14px',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeftOutlined /> Quay lại Trang dịch vụ khách hàng
          </Link>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          bodyStyle={{ padding: '28px 24px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div
              style={{
                width: 52,
                height: 52,
                background: '#1677ff',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 8px 16px rgba(22,119,255,0.3)',
              }}
            >
              <span style={{ fontSize: '26px' }}>🔧</span>
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              TechFix System
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Trung tâm Dịch vụ & Quản lý sửa chữa thiết bị
            </Text>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setErrorMessage('');
              setRegisterError('');
            }}
            centered
            items={[
              {
                key: 'login',
                label: <span style={{ fontWeight: 600, padding: '0 8px' }}>Đăng nhập</span>,
                children: (
                  <div style={{ marginTop: 8 }}>
                    {errorMessage && (
                      <Alert
                        message="Lỗi đăng nhập"
                        description={errorMessage}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setErrorMessage('')}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                      />
                    )}

                    <Form
                      form={loginForm}
                      name="login_form"
                      layout="vertical"
                      onFinish={onLoginFinish}
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
                          placeholder="Tên đăng nhập hoặc SĐT..."
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
                          placeholder="Nhập mật khẩu..."
                          size="large"
                          autoComplete="current-password"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginTop: 20, marginBottom: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          loading={loading}
                          block
                          style={{
                            height: 44,
                            borderRadius: 8,
                            fontSize: '15px',
                            fontWeight: 600,
                          }}
                        >
                          {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                        </Button>
                      </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        Chưa có tài khoản?{' '}
                        <a
                          style={{ fontWeight: 600, color: '#1677ff' }}
                          onClick={() => setActiveTab('register')}
                        >
                          Đăng ký tài khoản khách hàng
                        </a>
                      </Text>
                    </div>

                  </div>
                ),
              },
              {
                key: 'register',
                label: <span style={{ fontWeight: 600, padding: '0 8px' }}>Đăng ký khách hàng</span>,
                children: (
                  <div style={{ marginTop: 8 }}>
                    {registerError && (
                      <Alert
                        message="Lỗi đăng ký"
                        description={registerError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setRegisterError('')}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                      />
                    )}

                    <Form
                      form={registerForm}
                      name="register_form"
                      layout="vertical"
                      onFinish={onRegisterFinish}
                      requiredMark="optional"
                    >
                      <Form.Item
                        label="Họ và tên của bạn"
                        name="reg_hoTen"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                      >
                        <Input
                          prefix={<IdcardOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Số điện thoại (Nhận diện thiết bị & tra cứu)"
                        name="reg_soDienThoai"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số điện thoại!' },
                          { pattern: /^[0-9+ ]{8,15}$/, message: 'Số điện thoại gồm 8-15 chữ số!' },
                        ]}
                        tooltip="Dùng để liên kết với các thiết bị và phiếu bảo hành của bạn tại cửa hàng"
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Ví dụ: 0912345678"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Email liên hệ (Không bắt buộc)"
                        name="reg_email"
                        rules={[{ type: 'email', message: 'Email không đúng định dạng!' }]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Ví dụ: nguyenvana@gmail.com"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item label="Mã liên kết hồ sơ cũ (nếu đã từng sửa máy tại cửa hàng)"
                        name="reg_maLienKet"
                        rules={[{ pattern: /^[A-Fa-f0-9]{32}$/, message: 'Mã gồm 32 ký tự hex.' }]}
                        tooltip="Nhận mã từ lễ tân sau khi xác minh tại cửa hàng; mã có hiệu lực 15 phút.">
                        <Input placeholder="Mã do lễ tân cung cấp" size="large" maxLength={32} />
                      </Form.Item>

                      <Form.Item
                        label="Tên đăng nhập"
                        name="reg_username"
                        rules={[
                          { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                          { min: 4, message: 'Tối thiểu 4 ký tự!' },
                          { pattern: /^[a-zA-Z0-9_.]+$/, message: 'Chỉ gồm chữ, số, dấu chấm và gạch dưới!' },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Ví dụ: khachhang_an hoặc dùng luôn SĐT"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Mật khẩu"
                        name="reg_password"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu!' },
                          { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Tối thiểu 6 ký tự"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Xác nhận lại mật khẩu"
                        name="reg_confirmPassword"
                        dependencies={['reg_password']}
                        rules={[
                          { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('reg_password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Nhập lại mật khẩu"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginTop: 20, marginBottom: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          loading={registerLoading}
                          block
                          style={{
                            height: 44,
                            borderRadius: 8,
                            fontSize: '15px',
                            fontWeight: 600,
                            background: '#10b981',
                            borderColor: '#10b981',
                          }}
                        >
                          {registerLoading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default LoginPage;
