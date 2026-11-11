import { useState } from 'react';
import { Card, Typography, Tabs, Select, Form, Button, Input, DatePicker, Row, Col, Divider, Steps, Space, Result, message, Tag } from 'antd';
import { 
  CalculatorOutlined, 
  CalendarOutlined, 
  SearchOutlined,
  ToolOutlined,
  LaptopOutlined,
  MobileOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data for pricing
const serviceCatalog = {
  laptop: [
    { id: 'l1', name: 'Vệ sinh máy, tra keo tản nhiệt (Arctic MX-4)', price: 150000 },
    { id: 'l2', name: 'Cài đặt hệ điều hành (Windows) & Phần mềm', price: 100000 },
    { id: 'l3', name: 'Nâng cấp RAM (Công thợ + RAM 8GB DDR4)', price: 650000 },
    { id: 'l4', name: 'Nâng cấp SSD (Công thợ + SSD 512GB NVMe)', price: 950000 },
    { id: 'l5', name: 'Sửa lỗi nguồn / Chập bo mạch (Mainboard)', price: 1200000 },
  ],
  pc: [
    { id: 'p1', name: 'Vệ sinh case PC, tra keo tản nhiệt CPU', price: 200000 },
    { id: 'p2', name: 'Lắp ráp PC trọn bộ / Đi dây lại (Cable management)', price: 300000 },
    { id: 'p3', name: 'Sửa VGA (Card màn hình) lỗi VRAM/Chíp', price: 1500000 },
  ],
  mobile: [
    { id: 'm1', name: 'Thay pin điện thoại (Cơ bản)', price: 450000 },
    { id: 'm2', name: 'Thay màn hình điện thoại (Phổ thông)', price: 1200000 },
    { id: 'm3', name: 'Ép kính điện thoại', price: 350000 },
  ]
};

// Mock data for tracking
const mockTickets = {
  'TN-20231027-01': {
    code: 'TN-20231027-01',
    device: 'Laptop Dell Inspiron 5510',
    status: 2,
    receiveDate: '27/10/2023 10:30',
    estimatedDone: '28/10/2023 15:00',
    issues: 'Máy bật không lên nguồn, sạc không vào',
    costs: [
      { item: 'Kiểm tra chẩn đoán lỗi', price: 0 },
      { item: 'Sửa IC Nguồn trên Mainboard', price: 850000 },
    ],
    totalCost: 850000
  },
  '0912345678': {
    code: 'TN-20231025-99',
    device: 'PC Gaming',
    status: 3, 
    receiveDate: '25/10/2023 14:00',
    estimatedDone: '26/10/2023 17:00',
    issues: 'Quạt kêu to, chơi game bị sập',
    costs: [
      { item: 'Vệ sinh case PC, tra keo tản nhiệt CPU', price: 200000 },
      { item: 'Thay quạt tản nhiệt case', price: 150000 },
    ],
    totalCost: 350000
  }
};

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Quote State
  const [deviceType, setDeviceType] = useState('laptop');
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalQuote, setTotalQuote] = useState(0);

  // Booking State
  const [bookingForm] = Form.useForm();
  const [isBooked, setIsBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Tracking State
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketResult, setTicketResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  const handleDeviceChange = (val) => {
    setDeviceType(val);
    setSelectedServices([]);
    setTotalQuote(0);
  };

  const handleServiceChange = (vals) => {
    setSelectedServices(vals);
    const catalog = serviceCatalog[deviceType];
    const total = vals.reduce((sum, serviceId) => {
      const service = catalog.find(s => s.id === serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
    setTotalQuote(total);
  };

  const jumpToBooking = () => {
    let issueDesc = `Dịch vụ yêu cầu:\n`;
    const catalog = serviceCatalog[deviceType];
    selectedServices.forEach(id => {
      const s = catalog.find(x => x.id === id);
      if (s) issueDesc += `- ${s.name}\n`;
    });

    bookingForm.setFieldsValue({
      deviceType: deviceType,
      issues: selectedServices.length > 0 ? issueDesc : ''
    });
    
    setActiveTab('2');
  };

  const handleBookAppointment = () => {
    const ref = `BK-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`;
    setBookingRef(ref);
    setIsBooked(true);
    message.success('Đặt lịch thành công!');
  };

  const resetBooking = () => {
    setIsBooked(false);
    bookingForm.resetFields();
  };

  const handleSearchTracking = (value) => {
    if (!value.trim()) {
      setSearchError('Vui lòng nhập Mã phiếu hoặc Số điện thoại');
      setTicketResult(null);
      return;
    }

    const res = mockTickets[value.trim()];
    if (res) {
      setTicketResult(res);
      setSearchError('');
    } else {
      setTicketResult(null);
      setSearchError('Không tìm thấy thông tin. Vui lòng kiểm tra lại số điện thoại hoặc mã phiếu.');
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '16px 0' }}>
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          centered
          items={[
            {
              key: '1',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalculatorOutlined /> Ước tính báo giá
                </span>
              ),
              children: (
                <div style={{ padding: '12px 0' }}>
                  <Row gutter={24}>
                    <Col xs={24} lg={14}>
                      <Form layout="vertical">
                        <Form.Item label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Loại thiết bị</span>}>
                          <Select value={deviceType} onChange={handleDeviceChange}>
                            <Option value="laptop"><LaptopOutlined /> Laptop</Option>
                            <Option value="pc"><ToolOutlined /> Máy tính để bàn (PC)</Option>
                            <Option value="mobile"><MobileOutlined /> Điện thoại / Máy tính bảng</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Hạng mục dịch vụ</span>}>
                          <Select 
                            mode="multiple" 
                            placeholder="Chọn dịch vụ cần thực hiện..." 
                            value={selectedServices}
                            onChange={handleServiceChange}
                            style={{ width: '100%' }}
                          >
                            {serviceCatalog[deviceType].map(item => (
                              <Option key={item.id} value={item.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                  <span>{item.name}</span>
                                  <span style={{ color: '#2563eb', fontWeight: 500 }}>{item.price.toLocaleString('vi-VN')} ₫</span>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Form>
                    </Col>
                    
                    <Col xs={24} lg={10}>
                      <Card style={{ background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
                        <Title level={5} style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', fontSize: '14px' }}>
                          Chi phí ước tính
                        </Title>
                        
                        <div style={{ minHeight: '100px', margin: '12px 0' }}>
                          {selectedServices.length === 0 ? (
                            <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '30px', fontSize: '13px' }}>
                              Chưa chọn hạng mục dịch vụ
                            </div>
                          ) : (
                            serviceCatalog[deviceType]
                              .filter(s => selectedServices.includes(s.id))
                              .map(s => (
                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                  <span style={{ flex: 1, paddingRight: '8px', color: '#334155' }}>{s.name}</span>
                                  <span style={{ whiteSpace: 'nowrap', fontWeight: 500, color: '#0f172a' }}>{s.price.toLocaleString('vi-VN')} ₫</span>
                                </div>
                              ))
                          )}
                        </div>
                        
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>Tổng cộng:</span>
                          <span style={{ fontWeight: 700, fontSize: '20px', color: '#0f172a' }}>
                            {totalQuote.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>

                        <Button 
                          type="primary" 
                          block 
                          style={{ marginTop: '16px', borderRadius: '6px' }}
                          icon={<CalendarOutlined />}
                          onClick={jumpToBooking}
                          disabled={selectedServices.length === 0}
                        >
                          Đặt lịch với báo giá này
                        </Button>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarOutlined /> Đặt lịch hẹn
                </span>
              ),
              children: (
                <div style={{ padding: '12px 0' }}>
                  {!isBooked ? (
                    <Form 
                      form={bookingForm} 
                      layout="vertical" 
                      onFinish={handleBookAppointment}
                      style={{ maxWidth: '540px', margin: '0 auto' }}
                      initialValues={{ deviceType: 'laptop' }}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label="Ngày hẹn" name="date" rules={[{ required: true, message: 'Chọn ngày' }]}>
                            <DatePicker 
                              style={{ width: '100%' }} 
                              disabledDate={(current) => current && current < dayjs().startOf('day')} 
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Khung giờ" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
                            <Select placeholder="Chọn khung giờ">
                              <Option value="08:00 - 09:30">08:00 - 09:30</Option>
                              <Option value="09:30 - 11:00">09:30 - 11:00</Option>
                              <Option value="13:30 - 15:00" disabled>13:30 - 15:00 (Hết chỗ)</Option>
                              <Option value="15:00 - 16:30">15:00 - 16:30</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                            <Input placeholder="Họ và tên" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                            <Input placeholder="09xx..." />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Loại thiết bị" name="deviceType">
                        <Select>
                          <Option value="laptop">Laptop</Option>
                          <Option value="pc">PC / Máy tính để bàn</Option>
                          <Option value="mobile">Điện thoại / Tablet</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Mô tả sự cố" name="issues" rules={[{ required: true, message: 'Mô tả sự cố' }]}>
                        <Input.TextArea rows={3} placeholder="Mô tả hiện tượng sự cố..." />
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ borderRadius: '6px' }}>
                          Xác nhận đặt lịch
                        </Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    <Result
                      status="success"
                      title="Đặt lịch hẹn thành công"
                      subTitle={
                        <div>
                          Mã lịch hẹn: <strong style={{ color: '#2563eb' }}>{bookingRef}</strong>
                        </div>
                      }
                      extra={[
                        <Button type="primary" key="track" onClick={() => setActiveTab('3')} style={{ borderRadius: '6px' }}>
                          Tra cứu tiến độ
                        </Button>,
                        <Button key="buy" onClick={resetBooking} style={{ borderRadius: '6px' }}>
                          Đặt lịch mới
                        </Button>,
                      ]}
                    />
                  )}
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SearchOutlined /> Tra cứu tiến độ
                </span>
              ),
              children: (
                <div style={{ padding: '12px 0', maxWidth: '640px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input 
                        placeholder="Nhập SĐT hoặc Mã phiếu (VD: TN-20231027-01)..." 
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onPressEnter={() => handleSearchTracking(searchQuery)}
                      />
                      <Button type="primary" onClick={() => handleSearchTracking(searchQuery)}>
                        Tra cứu
                      </Button>
                    </Space.Compact>
                    {searchError && <div style={{ color: '#ef4444', marginTop: '6px', fontSize: '13px' }}>{searchError}</div>}
                  </div>

                  {ticketResult && (
                    <Card 
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>{ticketResult.code}</span>
                          <Tag color="blue">{ticketResult.device}</Tag>
                        </div>
                      }
                      style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    >
                      <Steps 
                        current={ticketResult.status} 
                        style={{ marginBottom: '24px', marginTop: '8px' }}
                        items={[
                          { title: 'Tiếp nhận', description: ticketResult.receiveDate },
                          { title: 'Kiểm tra' },
                          { title: 'Sửa chữa' },
                          { title: 'Hoàn tất', description: ticketResult.status === 3 ? 'Sẵn sàng trả' : ticketResult.estimatedDone },
                        ]}
                      />

                      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Tình trạng:</Text>
                          <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '13px', marginTop: '2px' }}>{ticketResult.issues}</div>
                        </div>
                        
                        <Divider style={{ margin: '10px 0' }} />
                        
                        <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Chi phí:</Text>
                        {ticketResult.costs.map((c, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                            <span style={{ color: '#475569' }}>{c.item}</span>
                            <span style={{ color: '#0f172a' }}>{c.price === 0 ? 'Miễn phí' : c.price.toLocaleString('vi-VN') + ' ₫'}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>Tổng thanh toán:</span>
                          <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{ticketResult.totalCost.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CustomerPortal;