import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Select,
  Form,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Divider,
  Steps,
  Alert,
  Space,
  Result,
  message,
  Tag,
  Timeline,
  Avatar,
  Badge,
} from 'antd';
import {
  CalculatorOutlined,
  CalendarOutlined,
  SearchOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LaptopOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  BarcodeOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Danh mục dịch vụ và báo giá ước tính
const serviceCatalog = {
  laptop: [
    { id: 'l1', name: 'Vệ sinh máy, tra keo tản nhiệt cao cấp (Arctic MX-4)', price: 150000 },
    { id: 'l2', name: 'Cài đặt hệ điều hành (Windows/macOS) & Phần mềm cơ bản', price: 100000 },
    { id: 'l3', name: 'Nâng cấp RAM Laptop (Công thợ + RAM 8GB DDR4 chính hãng)', price: 650000 },
    { id: 'l4', name: 'Nâng cấp ổ cứng SSD (Công thợ + SSD NVMe 512GB)', price: 950000 },
    { id: 'l5', name: 'Sửa lỗi nguồn / Chập bo mạch (Mainboard)', price: 1200000 },
    { id: 'l6', name: 'Thay thế màn hình Laptop (FHD IPS)', price: 1450000 },
  ],
  pc: [
    { id: 'p1', name: 'Vệ sinh case PC toàn diện, tra keo tản nhiệt CPU/GPU', price: 200000 },
    { id: 'p2', name: 'Lắp ráp PC trọn bộ / Đi dây thẩm mỹ (Cable management)', price: 300000 },
    { id: 'p3', name: 'Sửa VGA (Card màn hình) lỗi VRAM/Chíp nguồn', price: 1500000 },
    { id: 'p4', name: 'Thay thế bộ nguồn máy tính (PSU 650W 80 Plus Bronze)', price: 1250000 },
  ],
  mobile: [
    { id: 'm1', name: 'Thay pin điện thoại dung lượng chuẩn', price: 450000 },
    { id: 'm2', name: 'Thay màn hình điện thoại (OLED/AMOLED)', price: 1200000 },
    { id: 'm3', name: 'Ép kính màn hình điện thoại', price: 350000 },
    { id: 'm4', name: 'Khắc phục sự cố loa / mic / cổng sạc', price: 300000 },
  ],
};

// Dữ liệu mẫu tra cứu tiến độ sửa chữa
const mockTickets = {
  'TN-20231027-01': {
    code: 'TN-20231027-01',
    device: 'Laptop Dell Inspiron 5510',
    status: 2, // 0: Đã tiếp nhận, 1: Đang kiểm tra, 2: Đang sửa chữa, 3: Hoàn tất
    receiveDate: '27/10/2026 10:30',
    estimatedDone: '28/10/2026 15:00',
    technician: 'KTV Trần Văn Bình',
    issues: 'Máy bật không lên nguồn, sạc không vào pin',
    costs: [
      { item: 'Kiểm tra chẩn đoán lỗi chuyên sâu', price: 0 },
      { item: 'Sửa IC Nguồn trên bo mạch chính', price: 850000 },
    ],
    totalCost: 850000,
  },
  '0912345678': {
    code: 'TN-20261025-99',
    device: 'PC Gaming GVN Core i7',
    status: 3,
    receiveDate: '25/10/2026 14:00',
    estimatedDone: '26/10/2026 17:00',
    technician: 'KTV Lê Hoàng Phúc',
    issues: 'Quạt kêu to, chơi game bị sập nguồn',
    costs: [
      { item: 'Vệ sinh case PC, tra keo tản nhiệt CPU', price: 200000 },
      { item: 'Thay quạt tản nhiệt case MasterFan', price: 150000 },
    ],
    totalCost: 350000,
  },
};

const CustomerPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('1');

  // --- Quote State ---
  const [deviceType, setDeviceType] = useState('laptop');
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalQuote, setTotalQuote] = useState(0);

  // --- Booking State ---
  const [bookingForm] = Form.useForm();
  const [isBooked, setIsBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // --- Tracking State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketResult, setTicketResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  // --- Serial Warranty State ---
  const [serialQuery, setSerialQuery] = useState('');
  const [warrantyResult, setWarrantyResult] = useState(null);
  const [searchingWarranty, setSearchingWarranty] = useState(false);
  const [warrantyError, setWarrantyError] = useState('');

  // Tự động điền thông tin nếu khách đã đăng nhập
  useEffect(() => {
    if (user && user.role === 'customer') {
      bookingForm.setFieldsValue({
        name: user.name || user.username,
      });
    }
  }, [user, bookingForm]);

  const handleDeviceChange = (val) => {
    setDeviceType(val);
    setSelectedServices([]);
    setTotalQuote(0);
  };

  const handleServiceChange = (vals) => {
    setSelectedServices(vals);
    const catalog = serviceCatalog[deviceType];
    const total = vals.reduce((sum, serviceId) => {
      const service = catalog.find((s) => s.id === serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
    setTotalQuote(total);
  };

  const jumpToBooking = () => {
    let issueDesc = `[Chuyển từ Báo giá trực tuyến] Hạng mục yêu cầu:\n`;
    const catalog = serviceCatalog[deviceType];
    selectedServices.forEach((id) => {
      const s = catalog.find((x) => x.id === id);
      if (s) issueDesc += `- ${s.name}\n`;
    });

    bookingForm.setFieldsValue({
      deviceType: deviceType,
      issues: selectedServices.length > 0 ? issueDesc : '',
    });

    setActiveTab('2');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleBookAppointment = (values) => {
    const ref = `BK-${dayjs().format('YYYYMMDD')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingRef(ref);
    setIsBooked(true);
    message.success('Đặt lịch hẹn thành công!');
  };

  const resetBooking = () => {
    setIsBooked(false);
    bookingForm.resetFields();
  };

  const handleSearchTracking = (value) => {
    const q = (value || searchQuery).trim();
    if (!q) {
      setSearchError('Vui lòng nhập Mã phiếu hoặc Số điện thoại để tra cứu!');
      setTicketResult(null);
      return;
    }

    const res = mockTickets[q];
    if (res) {
      setTicketResult(res);
      setSearchError('');
    } else {
      setTicketResult(null);
      setSearchError(
        `Không tìm thấy phiếu sửa chữa cho "${q}". Bạn vui lòng kiểm tra lại số điện thoại hoặc mã phiếu.`
      );
    }
  };

  const handleSearchWarranty = async (inputSerial) => {
    const s = (inputSerial || serialQuery).trim().toUpperCase();
    if (!s) {
      setWarrantyError('Vui lòng nhập số Serial của linh kiện!');
      setWarrantyResult(null);
      return;
    }

    setSearchingWarranty(true);
    setWarrantyError('');
    setWarrantyResult(null);

    try {
      const res = await api.traCuuBaoHanhSerial(s);
      const data = res?.data || res;
      if (data) {
        setWarrantyResult(data);
      } else {
        setWarrantyError(
          `Không tìm thấy số Serial "${s}". Linh kiện có thể không thuộc hệ thống TechFix.`
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        `Không tìm thấy số Serial "${s}". Linh kiện có thể không phải hàng do cửa hàng bán ra.`;
      setWarrantyError(msg);
    } finally {
      setSearchingWarranty(false);
    }
  };

  const isStaff = user && user.role !== 'customer';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* ── HEADER CÔNG KHAI ── */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Logo & Tên thương hiệu */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => {
              setActiveTab('1');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: 20,
                boxShadow: '0 4px 10px rgba(22,119,255,0.25)',
              }}
            >
              🔧
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                TechFix <span style={{ color: '#1677ff', fontSize: '14px', fontWeight: 600 }}>Service</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Trung tâm Bảo dưỡng & Sửa chữa Thiết bị Điện tử</div>
            </div>
          </div>

          {/* Điều hướng nhanh các Tab */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button
              type={activeTab === '1' ? 'primary' : 'text'}
              icon={<CalculatorOutlined />}
              onClick={() => setActiveTab('1')}
            >
              Báo giá
            </Button>
            <Button
              type={activeTab === '2' ? 'primary' : 'text'}
              icon={<CalendarOutlined />}
              onClick={() => setActiveTab('2')}
            >
              Đặt lịch hẹn
            </Button>
            <Button
              type={activeTab === '3' ? 'primary' : 'text'}
              icon={<SearchOutlined />}
              onClick={() => setActiveTab('3')}
            >
              Tra cứu máy
            </Button>
            <Button
              type={activeTab === '4' ? 'primary' : 'text'}
              icon={<SafetyCertificateOutlined />}
              onClick={() => setActiveTab('4')}
            >
              Bảo hành Serial
            </Button>
          </div>

          {/* Khu vực Tài khoản / Đăng nhập */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <Space size="middle">
                <Space>
                  <Avatar style={{ backgroundColor: isStaff ? '#f59e0b' : '#3b82f6' }} icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      {user.name || user.username}
                    </div>
                    <Tag color={isStaff ? 'gold' : 'blue'} style={{ fontSize: 10, padding: '0 6px', margin: 0 }}>
                      {user.roleName || (isStaff ? 'Nhân sự' : 'Khách hàng')}
                    </Tag>
                  </div>
                </Space>

                {isStaff ? (
                  <Button
                    type="primary"
                    icon={<DashboardOutlined />}
                    style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
                    onClick={() => navigate('/dashboard')}
                  >
                    Vào Bàn Làm Việc
                  </Button>
                ) : (
                  <Button
                    icon={<LogoutOutlined />}
                    danger
                    onClick={() => {
                      logout();
                      message.info('Đã đăng xuất.');
                    }}
                  >
                    Đăng xuất
                  </Button>
                )}
              </Space>
            ) : (
              <Space>
                <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/login', { state: { tab: 'register' } })}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  Đăng ký tài khoản
                </Button>
              </Space>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO BANNER GIỚI THIỆU ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '48px 20px 40px',
          textAlign: 'center',
          borderBottom: '1px solid #334155',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Tag color="cyan" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>
            ✨ Cam kết sửa chữa chuyên nghiệp • Minh bạch 100%
          </Tag>
          <Title level={2} style={{ color: '#ffffff', margin: '0 0 12px', fontWeight: 800 }}>
            Hệ thống Sửa chữa & Bảo dưỡng Thiết bị Công nghệ
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: '16px', maxWidth: 680, margin: '0 auto 28px' }}>
            Tra cứu báo giá tức thì, đặt lịch trực tuyến không chờ đợi, theo dõi tiến độ sửa máy từng phút và tra cứu
            nguồn gốc linh kiện chính hãng qua mã Serial.
          </Paragraph>

          <Row gutter={[16, 16]} justify="center">
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: 4 }}>⚡</div>
                <Text style={{ color: '#f1f5f9', fontWeight: 600, display: 'block' }}>Lấy máy nhanh</Text>
                <Text style={{ color: '#94a3b8', fontSize: '12px' }}>Sửa chữa trong ngày</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: 4 }}>💎</div>
                <Text style={{ color: '#f1f5f9', fontWeight: 600, display: 'block' }}>Linh kiện chuẩn</Text>
                <Text style={{ color: '#94a3b8', fontSize: '12px' }}>Quản lý mã Serial</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: 4 }}>🔍</div>
                <Text style={{ color: '#f1f5f9', fontWeight: 600, display: 'block' }}>Theo dõi trực tiếp</Text>
                <Text style={{ color: '#94a3b8', fontSize: '12px' }}>Tra cứu qua SĐT</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: 4 }}>🛡️</div>
                <Text style={{ color: '#f1f5f9', fontWeight: 600, display: 'block' }}>Bảo hành dài hạn</Text>
                <Text style={{ color: '#94a3b8', fontSize: '12px' }}>Đổi mới linh kiện lỗi</Text>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ── NỘI DUNG CHÍNH (TABS) ── */}
      <main style={{ flex: 1, maxWidth: 1050, width: '100%', margin: '0 auto', padding: '32px 16px' }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
          }}
          bodyStyle={{ padding: '24px 28px' }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" centered>
            {/* TAB 1: BÁO GIÁ */}
            <Tabs.TabPane
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalculatorOutlined /> Ước tính báo giá
                </span>
              }
              key="1"
            >
              <div style={{ padding: '16px 0' }}>
                <Title level={4}>Dự toán chi phí sửa chữa & linh kiện</Title>
                <Paragraph type="secondary">
                  Chọn loại thiết bị và các dịch vụ bạn quan tâm để ước lượng chi phí minh bạch trước khi mang máy tới cửa hàng.
                </Paragraph>

                <Row gutter={32} style={{ marginTop: 24 }}>
                  <Col xs={24} lg={14}>
                    <Form layout="vertical">
                      <Form.Item label="Loại thiết bị">
                        <Select value={deviceType} onChange={handleDeviceChange} size="large">
                          <Option value="laptop">
                            <LaptopOutlined /> Laptop / Máy tính xách tay
                          </Option>
                          <Option value="pc">
                            <ToolOutlined /> Máy tính để bàn (PC)
                          </Option>
                          <Option value="mobile">
                            <MobileOutlined /> Điện thoại / Máy tính bảng
                          </Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Hạng mục sự cố / Dịch vụ cần thực hiện">
                        <Select
                          mode="multiple"
                          size="large"
                          placeholder="Có thể chọn một hoặc nhiều dịch vụ..."
                          value={selectedServices}
                          onChange={handleServiceChange}
                          style={{ width: '100%' }}
                        >
                          {serviceCatalog[deviceType].map((item) => (
                            <Option key={item.id} value={item.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <span>{item.name}</span>
                                <span style={{ color: '#1677ff', fontWeight: 600 }}>{item.price.toLocaleString()}đ</span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Form>

                    <Alert
                      message="Cam kết giá chuẩn không phát sinh"
                      description="Báo giá đã bao gồm công khám, kiểm tra và bảo hành linh kiện. Cửa hàng chỉ tiến hành sửa khi khách hàng đã đồng ý với báo giá chính thức."
                      type="info"
                      showIcon
                      style={{ marginTop: 20, marginBottom: 24, borderRadius: 8 }}
                    />
                  </Col>

                  <Col xs={24} lg={10}>
                    <Card
                      style={{
                        background: '#f8fafc',
                        borderColor: '#cbd5e1',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Title level={5} style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                        Tổng chi phí dự tính
                      </Title>

                      <div style={{ minHeight: 120, margin: '16px 0' }}>
                        {selectedServices.length === 0 ? (
                          <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 36 }}>
                            Vui lòng chọn các dịch vụ bên trái
                          </div>
                        ) : (
                          serviceCatalog[deviceType]
                            .filter((s) => selectedServices.includes(s.id))
                            .map((s) => (
                              <div
                                key={s.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: 10,
                                  fontSize: '13px',
                                }}
                              >
                                <span style={{ flex: 1, paddingRight: 8, color: '#334155' }}>{s.name}</span>
                                <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                  {s.price.toLocaleString()}đ
                                </span>
                              </div>
                            ))
                        )}
                      </div>

                      <Divider style={{ margin: '12px 0' }} />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>Tạm tính:</span>
                        <span style={{ fontWeight: 700, fontSize: '24px', color: '#dc2626' }}>
                          {totalQuote.toLocaleString()}đ
                        </span>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        style={{ marginTop: 20, height: 44, borderRadius: 8, fontWeight: 600 }}
                        icon={<CalendarOutlined />}
                        onClick={jumpToBooking}
                        disabled={selectedServices.length === 0}
                      >
                        Đặt lịch với dịch vụ này
                      </Button>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tabs.TabPane>

            {/* TAB 2: ĐẶT LỊCH HẸN */}
            <Tabs.TabPane
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined /> Đặt lịch hẹn
                </span>
              }
              key="2"
            >
              <div style={{ padding: '16px 0' }}>
                {!isBooked ? (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <Title level={4}>Đặt trước lịch tiếp nhận dịch vụ</Title>
                      <Paragraph type="secondary">
                        Chủ động chọn thời gian mang máy đến để được nhân viên tiếp nhận ngay, không phải xếp hàng chờ.
                      </Paragraph>
                    </div>

                    <Form
                      form={bookingForm}
                      layout="vertical"
                      onFinish={handleBookAppointment}
                      style={{ maxWidth: 640, margin: '0 auto' }}
                      initialValues={{ deviceType: 'laptop' }}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Họ và tên của bạn"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                          >
                            <Input size="large" placeholder="Ví dụ: Hoàng Văn Khách" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Số điện thoại liên hệ"
                            name="phone"
                            rules={[
                              { required: true, message: 'Vui lòng nhập số điện thoại' },
                              { pattern: /^[0-9+ ]{8,15}$/, message: 'Số điện thoại gồm 8-15 chữ số' },
                            ]}
                          >
                            <Input size="large" placeholder="Ví dụ: 0912345678" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Ngày dự kiến mang máy tới"
                            name="date"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}
                          >
                            <DatePicker
                              style={{ width: '100%' }}
                              size="large"
                              disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Khung giờ"
                            name="time"
                            rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
                          >
                            <Select size="large" placeholder="Chọn khung giờ thuận tiện">
                              <Option value="08:00 - 09:30">08:00 - 09:30 (Sáng sớm - Vắng)</Option>
                              <Option value="09:30 - 11:30">09:30 - 11:30 (Buổi sáng)</Option>
                              <Option value="13:30 - 15:30">13:30 - 15:30 (Đầu giờ chiều)</Option>
                              <Option value="15:30 - 17:30">15:30 - 17:30 (Cuối giờ chiều)</Option>
                              <Option value="17:30 - 19:30">17:30 - 19:30 (Sau giờ hành chính)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Loại thiết bị" name="deviceType">
                        <Select size="large">
                          <Option value="laptop">Laptop / Máy tính xách tay</Option>
                          <Option value="pc">Máy tính để bàn (PC)</Option>
                          <Option value="mobile">Điện thoại thông minh / Tablet</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Mô tả sự cố hoặc yêu cầu sửa chữa"
                        name="issues"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả sự cố' }]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Ví dụ: Máy không lên nguồn, sạc pin không vào, quạt kêu to..."
                        />
                      </Form.Item>

                      <Form.Item style={{ marginTop: 24 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          style={{ height: 46, borderRadius: 8, fontSize: '16px', fontWeight: 600 }}
                        >
                          Xác nhận đặt lịch hẹn
                        </Button>
                      </Form.Item>
                    </Form>
                  </>
                ) : (
                  <Result
                    status="success"
                    title="Đặt lịch hẹn dịch vụ thành công!"
                    subTitle={
                      <div style={{ maxWidth: 540, margin: '0 auto', fontSize: '15px' }}>
                        <p>
                          Mã lịch hẹn của bạn là:{' '}
                          <strong style={{ fontSize: '20px', color: '#1677ff' }}>{bookingRef}</strong>
                        </p>
                        <p style={{ color: '#64748b' }}>
                          Vui lòng đến đúng khung giờ đã chọn và cung cấp mã lịch hẹn này cho Lễ tân để được ưu tiên xử lý ngay.
                        </p>
                      </div>
                    }
                    extra={[
                      <Button type="primary" key="track" onClick={() => setActiveTab('3')} size="large">
                        Chuyển sang Tra cứu tiến độ
                      </Button>,
                      <Button key="buy" onClick={resetBooking} size="large">
                        Đặt thêm lịch khác
                      </Button>,
                    ]}
                  />
                )}
              </div>
            </Tabs.TabPane>

            {/* TAB 3: TRA CỨU TIẾN ĐỘ THIẾT BỊ */}
            <Tabs.TabPane
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SearchOutlined /> Tra cứu tiến độ máy
                </span>
              }
              key="3"
            >
              <div style={{ padding: '16px 0', maxWidth: 760, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <Title level={4}>Tra cứu tiến độ sửa chữa thiết bị</Title>
                  <Paragraph type="secondary">
                    Nhập số điện thoại hoặc mã phiếu tiếp nhận (ví dụ:{' '}
                    <code style={{ color: '#1677ff' }}>0912345678</code> hoặc{' '}
                    <code style={{ color: '#1677ff' }}>TN-20231027-01</code>) để xem tình trạng hiện tại của máy.
                  </Paragraph>

                  <Space.Compact style={{ width: '100%', maxWidth: 540, marginTop: 12 }}>
                    <Input
                      size="large"
                      placeholder="Nhập SĐT hoặc Mã phiếu..."
                      prefix={<SearchOutlined style={{ color: '#1677ff' }} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onPressEnter={() => handleSearchTracking(searchQuery)}
                    />
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => handleSearchTracking(searchQuery)}
                      style={{ fontWeight: 600 }}
                    >
                      Tra cứu ngay
                    </Button>
                  </Space.Compact>

                  {searchError && (
                    <Alert
                      type="warning"
                      showIcon
                      message={searchError}
                      style={{ marginTop: 14, textAlign: 'left', borderRadius: 8 }}
                    />
                  )}
                </div>

                {ticketResult && (
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span>
                          Phiếu tiếp nhận: <strong>{ticketResult.code}</strong>
                        </span>
                        <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
                          {ticketResult.device}
                        </Tag>
                      </div>
                    }
                    style={{ borderRadius: 12, border: '1px solid #bfdbfe' }}
                    headStyle={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}
                  >
                    <Steps
                      current={ticketResult.status}
                      style={{ marginBottom: 28, marginTop: 12 }}
                      items={[
                        { title: 'Tiếp nhận', description: ticketResult.receiveDate },
                        { title: 'Kiểm tra', description: 'Chẩn đoán lỗi' },
                        { title: 'Đang sửa', description: ticketResult.technician },
                        {
                          title: ticketResult.status === 3 ? 'Hoàn thành' : 'Chờ giao',
                          description:
                            ticketResult.status === 3
                              ? 'Sẵn sàng trả máy'
                              : 'Dự kiến: ' + ticketResult.estimatedDone,
                        },
                      ]}
                    />

                    <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div style={{ marginBottom: 14 }}>
                        <Text type="secondary">Tình trạng sự cố ghi nhận:</Text>
                        <div style={{ fontWeight: 600, marginTop: 4, color: '#1e293b' }}>
                          {ticketResult.issues}
                        </div>
                      </div>

                      <Divider style={{ margin: '12px 0' }} />

                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        Chi tiết chi phí sửa chữa & linh kiện thay thế:
                      </Text>
                      {ticketResult.costs.map((c, i) => (
                        <div
                          key={i}
                          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '13px' }}
                        >
                          <span>{c.item}</span>
                          <span style={{ fontWeight: 500 }}>
                            {c.price === 0 ? 'Miễn phí' : c.price.toLocaleString() + 'đ'}
                          </span>
                        </div>
                      ))}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: '1px solid #cbd5e1',
                        }}
                      >
                        <strong style={{ fontSize: '15px' }}>Tổng thanh toán:</strong>
                        <strong style={{ fontSize: '20px', color: '#dc2626' }}>
                          {ticketResult.totalCost.toLocaleString()}đ
                        </strong>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Tabs.TabPane>

            {/* TAB 4: TRA CỨU BẢO HÀNH SERIAL */}
            <Tabs.TabPane
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SafetyCertificateOutlined /> Tra cứu bảo hành Serial
                </span>
              }
              key="4"
            >
              <div style={{ padding: '16px 0', maxWidth: 760, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <Title level={4}>Tra cứu bảo hành & nguồn gốc linh kiện</Title>
                  <Paragraph type="secondary">
                    Nhập số Serial (in trên tem bảo hành hoặc biên nhận) để kiểm tra tính chính hãng, nguồn gốc nhập kho và thời hạn bảo hành.
                  </Paragraph>

                  <Space.Compact style={{ width: '100%', maxWidth: 540, marginTop: 12 }}>
                    <Input
                      size="large"
                      placeholder="Nhập số Serial (VD: KVR-8G-2610-09881)..."
                      prefix={<BarcodeOutlined style={{ color: '#1677ff' }} />}
                      value={serialQuery}
                      onChange={(e) => setSerialQuery(e.target.value)}
                      onPressEnter={() => handleSearchWarranty(serialQuery)}
                      style={{ fontFamily: 'monospace' }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      loading={searchingWarranty}
                      onClick={() => handleSearchWarranty(serialQuery)}
                      style={{ fontWeight: 600 }}
                    >
                      Kiểm tra
                    </Button>
                  </Space.Compact>

                  {warrantyError && (
                    <Alert
                      type="error"
                      showIcon
                      message={warrantyError}
                      style={{ marginTop: 14, textAlign: 'left', borderRadius: 8 }}
                    />
                  )}
                </div>

                {warrantyResult && (
                  <Card
                    title={
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <Space>
                          <SafetyCertificateOutlined
                            style={{ color: warrantyResult.conBaoHanh ? '#10b981' : '#f59e0b', fontSize: 20 }}
                          />
                          <span>
                            Mã Serial:{' '}
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {warrantyResult.soSerial}
                            </span>
                          </span>
                        </Space>
                        <Tag
                          color={
                            warrantyResult.conBaoHanh
                              ? 'success'
                              : warrantyResult.trangThai === 'TRONG_KHO'
                              ? 'processing'
                              : 'warning'
                          }
                        >
                          {warrantyResult.conBaoHanh
                            ? 'CÒN BẢO HÀNH'
                            : warrantyResult.trangThai === 'TRONG_KHO'
                            ? 'TRONG KHO'
                            : 'HẾT BẢO HÀNH'}
                        </Tag>
                      </div>
                    }
                    style={{ borderRadius: 12, border: '1px solid #cbd5e1' }}
                  >
                    <Alert
                      type={
                        warrantyResult.conBaoHanh
                          ? 'success'
                          : warrantyResult.trangThai === 'TRONG_KHO'
                          ? 'info'
                          : 'warning'
                      }
                      showIcon
                      message={warrantyResult.thongBao}
                      style={{ marginBottom: 20, borderRadius: 8 }}
                    />

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '16px 20px',
                        borderRadius: 10,
                        marginBottom: 24,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Row gutter={[16, 12]}>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Tên linh kiện:</Text>
                          <div style={{ fontWeight: 600, fontSize: '15px', color: '#1677ff' }}>
                            {warrantyResult.tenLinhKien}
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Hãng sản xuất:</Text>
                          <div style={{ fontWeight: 500 }}>{warrantyResult.hangSanXuat || 'Chính hãng'}</div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Nhà cung cấp:</Text>
                          <div style={{ fontWeight: 500 }}>{warrantyResult.tenNcc}</div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Hạn bảo hành đến:</Text>
                          <div
                            style={{
                              fontWeight: 600,
                              color: warrantyResult.conBaoHanh ? '#10b981' : '#dc2626',
                            }}
                          >
                            {warrantyResult.baoHanhDen
                              ? dayjs(warrantyResult.baoHanhDen).format('DD/MM/YYYY')
                              : 'Theo phiếu bàn giao'}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Title level={5} style={{ marginBottom: 16 }}>
                      Vòng đời linh kiện & Nguồn gốc xuất xứ
                    </Title>
                    <Timeline
                      items={[
                        {
                          color: 'green',
                          children: (
                            <div>
                              <div style={{ fontWeight: 600 }}>Nhập kho chính hãng</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Ngày nhập: {dayjs(warrantyResult.ngayNhapKho).format('DD/MM/YYYY')} • Đơn vị cung ứng:{' '}
                                <b>{warrantyResult.tenNcc}</b>
                              </div>
                            </div>
                          ),
                        },
                        {
                          color: warrantyResult.ngayXuat ? 'blue' : 'gray',
                          children: warrantyResult.ngayXuat ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>Xuất kho lắp ráp cho thiết bị khách hàng</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Ngày xuất: {dayjs(warrantyResult.ngayXuat).format('DD/MM/YYYY')}
                                {warrantyResult.tenThietBi && ` • Thiết bị: ${warrantyResult.tenThietBi}`}
                                {warrantyResult.maPhieuSuaChua && ` (Phiếu: ${warrantyResult.maPhieuSuaChua})`}
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: '#64748b' }}>
                              <div>Đang lưu trong kho linh kiện TechFix</div>
                              <div style={{ fontSize: '12px' }}>Linh kiện mới 100%, sẵn sàng thay thế</div>
                            </div>
                          ),
                        },
                        {
                          color: warrantyResult.conBaoHanh ? 'green' : warrantyResult.baoHanhDen ? 'red' : 'gray',
                          children: (
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {warrantyResult.conBaoHanh
                                  ? `Bảo hành hiệu lực đến ${dayjs(warrantyResult.baoHanhDen).format('DD/MM/YYYY')}`
                                  : warrantyResult.baoHanhDen
                                  ? `Đã hết hạn bảo hành (${dayjs(warrantyResult.baoHanhDen).format('DD/MM/YYYY')})`
                                  : 'Theo chính sách bảo hành TechFix'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Hỗ trợ kiểm tra miễn phí trong suốt thời gian bảo hành.
                              </div>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </Card>
                )}
              </div>
            </Tabs.TabPane>

            {/* TAB 5: DÀNH CHO KHÁCH HÀNG ĐÃ ĐĂNG NHẬP */}
            {user && (
              <Tabs.TabPane
                tab={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined /> Tài khoản của tôi
                  </span>
                }
                key="5"
              >
                <div style={{ padding: '16px 0', maxWidth: 700, margin: '0 auto' }}>
                  <Card style={{ borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <Avatar size={64} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          {user.name || user.username}
                        </Title>
                        <Text type="secondary">Tên tài khoản: @{user.username}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="green">Tài khoản khách hàng chính thức</Tag>
                        </div>
                      </div>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <Title level={5}>Dịch vụ của bạn tại TechFix</Title>
                    <Paragraph type="secondary">
                      Tất cả các phiếu tiếp nhận sửa chữa được ghi nhận bằng số điện thoại của bạn sẽ hiển thị tại mục tra cứu.
                    </Paragraph>

                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={() => setActiveTab('3')}
                      style={{ marginTop: 8 }}
                    >
                      Tra cứu phiếu sửa chữa của tôi ngay
                    </Button>
                  </Card>
                </div>
              </Tabs.TabPane>
            )}
          </Tabs>
        </Card>
      </main>

      {/* ── FOOTER CHUYÊN NGHIỆP ── */}
      <footer
        style={{
          background: '#0f172a',
          color: '#94a3b8',
          borderTop: '1px solid #1e293b',
          padding: '36px 20px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
            marginBottom: 28,
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
              🔧 TechFix Center
            </div>
            <Paragraph style={{ color: '#94a3b8', fontSize: '13px' }}>
              Trung tâm tiếp nhận, bảo hành và sửa chữa thiết bị công nghệ hàng đầu. Đảm bảo uy tín, nguồn gốc linh kiện minh bạch.
            </Paragraph>
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: 12 }}>
              Thông tin liên hệ
            </div>
            <div style={{ fontSize: '13px', lineHeight: 2 }}>
              <div><EnvironmentOutlined style={{ marginRight: 8 }} /> Số 123 Đường Công Nghệ, Cầu Giấy, Hà Nội</div>
              <div><PhoneOutlined style={{ marginRight: 8 }} /> Hotline: <b>1800 6868</b> (Miễn phí)</div>
              <div><ClockCircleOutlined style={{ marginRight: 8 }} /> Giờ mở cửa: 08:00 - 20:30 (Cả CN & Ngày lễ)</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: 12 }}>
              Cổng nội bộ nhân viên
            </div>
            <Paragraph style={{ color: '#94a3b8', fontSize: '13px' }}>
              Dành riêng cho nhân viên Lễ tân, Kỹ thuật viên, Thủ kho và Quản trị viên TechFix.
            </Paragraph>
            <Button
              ghost
              style={{ color: '#94a3b8', borderColor: '#475569' }}
              onClick={() => navigate('/login')}
            >
              🔐 Đăng nhập Quản trị viên / Nhân sự
            </Button>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            borderTop: '1px solid #1e293b',
            paddingTop: 16,
            textAlign: 'center',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          © 2026 TechFix System - Dự án Hệ thống Quản lý Dịch vụ Sửa chữa Thiết bị. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CustomerPortal;
