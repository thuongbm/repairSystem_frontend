import React, { useState } from 'react';
import { Card, Typography, Tabs, Select, Form, Button, Input, DatePicker, Row, Col, Divider, Steps, Alert, Space, Result, message, Tag } from 'antd';
import { 
  CalculatorOutlined, 
  CalendarOutlined, 
  SearchOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LaptopOutlined,
  MobileOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Step } = Steps;

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
    status: 2, // 0: Đã tiếp nhận, 1: Đang tháo lắp, 2: Đang sửa chữa, 3: Hoàn tất
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
    // Populate form with quote data
    let issueDesc = `[Chuyển từ Báo giá] Yêu cầu các dịch vụ:\n`;
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

  const handleBookAppointment = (values) => {
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Title level={2} style={{ color: '#1677ff', marginBottom: '10px' }}>Trung tâm dịch vụ TechFix</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>Giải pháp bảo trì & sửa chữa thiết bị điện tử minh bạch, uy tín</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" centered>
          
          {/* TAB 1: BÁO GIÁ */}
          <TabPane 
            tab={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CalculatorOutlined /> Ước tính báo giá</span>} 
            key="1"
          >
            <div style={{ padding: '20px 0' }}>
              <Title level={4}>Dự toán chi phí sửa chữa</Title>
              <Paragraph type="secondary">Chọn loại thiết bị và các dịch vụ bạn cần để hệ thống ước tính chi phí trước khi mang máy đến cửa hàng.</Paragraph>
              
              <Row gutter={32} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={14}>
                  <Form layout="vertical">
                    <Form.Item label="Loại thiết bị">
                      <Select value={deviceType} onChange={handleDeviceChange} size="large">
                        <Option value="laptop"><LaptopOutlined /> Laptop / Máy tính xách tay</Option>
                        <Option value="pc"><ToolOutlined /> Máy tính để bàn (PC)</Option>
                        <Option value="mobile"><MobileOutlined /> Điện thoại / Máy tính bảng</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Hạng mục sự cố / Dịch vụ cần làm">
                      <Select 
                        mode="multiple" 
                        size="large"
                        placeholder="Có thể chọn nhiều dịch vụ..." 
                        value={selectedServices}
                        onChange={handleServiceChange}
                        style={{ width: '100%' }}
                      >
                        {serviceCatalog[deviceType].map(item => (
                          <Option key={item.id} value={item.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                              <span>{item.name}</span>
                              <span style={{ color: '#1677ff', fontWeight: 500 }}>{item.price.toLocaleString()}đ</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Form>
                  
                  <Alert 
                    message="Cam kết minh bạch" 
                    description="Giá trên đã bao gồm tiền công thợ và linh kiện cơ bản. Cửa hàng sẽ kiểm tra thực tế và chốt báo giá cuối cùng trước khi tiến hành sửa chữa, tuyệt đối không phát sinh phụ phí ẩn." 
                    type="info" 
                    showIcon 
                    style={{ marginTop: '20px', marginBottom: '24px' }}
                  />
                </Col>
                
                <Col xs={24} lg={10}>
                  <Card style={{ background: '#fafafa', borderColor: '#e6f4ff', borderRadius: '8px' }}>
                    <Title level={5} style={{ marginTop: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>Tổng chi phí dự kiến</Title>
                    
                    <div style={{ minHeight: '120px', margin: '16px 0' }}>
                      {selectedServices.length === 0 ? (
                        <div style={{ color: '#bfbfbf', textAlign: 'center', paddingTop: '40px' }}>Vui lòng chọn dịch vụ</div>
                      ) : (
                        serviceCatalog[deviceType]
                          .filter(s => selectedServices.includes(s.id))
                          .map(s => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                              <span style={{ flex: 1, paddingRight: '8px' }}>{s.name}</span>
                              <span style={{ whiteSpace: 'nowrap' }}>{s.price.toLocaleString()}đ</span>
                            </div>
                          ))
                      )}
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Tổng cộng:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '24px', color: '#f5222d' }}>{totalQuote.toLocaleString()}đ</span>
                    </div>

                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      style={{ marginTop: '24px' }}
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
          </TabPane>

          {/* TAB 2: ĐẶT LỊCH */}
          <TabPane 
            tab={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CalendarOutlined /> Đặt lịch hẹn</span>} 
            key="2"
          >
            <div style={{ padding: '20px 0' }}>
              {!isBooked ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={4}>Đặt lịch hẹn dịch vụ</Title>
                    <Paragraph type="secondary">Chủ động chọn thời gian phù hợp để không phải xếp hàng chờ đợi.</Paragraph>
                  </div>

                  <Form 
                    form={bookingForm} 
                    layout="vertical" 
                    onFinish={handleBookAppointment}
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                    initialValues={{ deviceType: 'laptop' }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item label="Ngày mang máy tới" name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                          <DatePicker 
                            style={{ width: '100%' }} 
                            size="large" 
                            disabledDate={(current) => current && current < dayjs().startOf('day')} 
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="Khung giờ" name="time" rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}>
                          <Select size="large" placeholder="Chọn khung giờ trống">
                            <Option value="08:00 - 09:30">08:00 - 09:30 (Còn 2 chỗ)</Option>
                            <Option value="09:30 - 11:00">09:30 - 11:00 (Còn 1 chỗ)</Option>
                            <Option value="13:30 - 15:00" disabled>13:30 - 15:00 (Đã kín)</Option>
                            <Option value="15:00 - 16:30">15:00 - 16:30 (Còn 4 chỗ)</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                          <Input size="large" placeholder="Nhập tên của bạn" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                          <Input size="large" placeholder="09xx..." />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Loại thiết bị" name="deviceType">
                      <Select size="large">
                        <Option value="laptop">Laptop / Máy tính xách tay</Option>
                        <Option value="pc">Máy tính để bàn (PC)</Option>
                        <Option value="mobile">Điện thoại / Máy tính bảng</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Mô tả chi tiết sự cố" name="issues" rules={[{ required: true, message: 'Vui lòng nhập mô tả sự cố' }]}>
                      <Input.TextArea rows={4} placeholder="Ví dụ: Máy dùng được 10 phút thì sập nguồn, quạt kêu to..." />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" block>
                        Xác nhận đặt lịch
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              ) : (
                <Result
                  status="success"
                  title="Đặt lịch hẹn thành công!"
                  subTitle={
                    <div>
                      <p>Mã lịch hẹn của bạn là: <strong style={{ fontSize: '18px', color: '#1677ff' }}>{bookingRef}</strong></p>
                      <p>Vui lòng mang thiết bị đến cửa hàng vào đúng khung giờ đã hẹn để được ưu tiên xử lý.</p>
                    </div>
                  }
                  extra={[
                    <Button type="primary" key="track" onClick={() => setActiveTab('3')}>
                      Tra cứu tiến độ
                    </Button>,
                    <Button key="buy" onClick={resetBooking}>
                      Đặt thêm lịch khác
                    </Button>,
                  ]}
                />
              )}
            </div>
          </TabPane>

          {/* TAB 3: TRA CỨU */}
          <TabPane 
            tab={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SearchOutlined /> Tra cứu tiến độ</span>} 
            key="3"
          >
            <div style={{ padding: '20px 0', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Title level={4}>Tra cứu tiến độ xử lý</Title>
                <Paragraph type="secondary">Nhập số điện thoại hoặc mã phiếu (ví dụ: TN-20231027-01) để xem trạng thái thiết bị của bạn.</Paragraph>
                
                <Space.Compact style={{ width: '100%', marginTop: '16px' }}>
                  <Input 
                    size="large" 
                    placeholder="Nhập SĐT hoặc Mã phiếu..." 
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onPressEnter={() => handleSearchTracking(searchQuery)}
                  />
                  <Button type="primary" size="large" onClick={() => handleSearchTracking(searchQuery)}>Tra cứu</Button>
                </Space.Compact>
                {searchError && <div style={{ color: '#ff4d4f', marginTop: '8px', textAlign: 'left' }}>{searchError}</div>}
              </div>

              {ticketResult && (
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Thông tin phiếu: {ticketResult.code}</span>
                      <Tag color="blue">{ticketResult.device}</Tag>
                    </div>
                  }
                  style={{ borderRadius: '8px', border: '1px solid #1677ff' }}
                  headStyle={{ background: '#e6f4ff', borderBottom: '1px solid #91caff' }}
                >
                  <Steps 
                    current={ticketResult.status} 
                    style={{ marginBottom: '32px', marginTop: '16px' }}
                    items={[
                      { title: 'Đã tiếp nhận', description: ticketResult.receiveDate },
                      { title: 'Đang kiểm tra', description: 'KTV tháo lắp' },
                      { title: 'Đang sửa chữa', description: 'Xử lý linh kiện' },
                      { title: 'Hoàn tất', description: ticketResult.status === 3 ? 'Sẵn sàng giao' : 'Dự kiến: ' + ticketResult.estimatedDone },
                    ]}
                  />

                  <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Text type="secondary">Tình trạng ghi nhận:</Text>
                      <div style={{ fontWeight: 500, marginTop: '4px' }}>{ticketResult.issues}</div>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Chi phí thực tế:</Text>
                    {ticketResult.costs.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>{c.item}</span>
                        <span>{c.price === 0 ? 'Miễn phí' : c.price.toLocaleString() + 'đ'}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #d9d9d9' }}>
                      <strong style={{ fontSize: '16px' }}>Tổng thanh toán:</strong>
                      <strong style={{ fontSize: '18px', color: '#f5222d' }}>{ticketResult.totalCost.toLocaleString()}đ</strong>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerPortal;
