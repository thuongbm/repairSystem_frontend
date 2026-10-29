import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Radio,
  Checkbox,
  InputNumber,
  Card,
  Tag,
  Divider,
  message
} from 'antd';
import {
  LaptopOutlined,
  UserOutlined,
  PhoneOutlined,
  PrinterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { TECHNICIANS_LIST } from './mockReceptionData';

const COMMON_ISSUES = [
  'Mất nguồn / Không bật lên',
  'Quạt hú to / Nóng tự sập',
  'Màn hình sọc rác / Không hiển thị',
  'Liệt bàn phím / Kẹt nút',
  'Không nhận sạc / Chân sạc lỏng',
  'Rơi nước / Đổ cà phê ẩm mạch',
  'Chạy chậm / Nhiễm virus nặng',
  'Nâng cấp RAM / Thay SSD tốc độ cao',
];

const ACCESSORY_OPTIONS = [
  'Củ sạc / Dây nguồn',
  'Túi chống sốc / Cặp xách',
  'Chuột rời / USB receiver',
  'Cáp kết nối HDMI / Type-C',
];

const IntakeModal = ({ visible, onCancel, onSubmitTicket }) => {
  const [form] = Form.useForm();
  const [selectedIssueTags, setSelectedIssueTags] = useState([]);
  const [previewTicket, setPreviewTicket] = useState(null);

  const handleToggleIssue = (issue) => {
    if (selectedIssueTags.includes(issue)) {
      setSelectedIssueTags(selectedIssueTags.filter((i) => i !== issue));
    } else {
      setSelectedIssueTags([...selectedIssueTags, issue]);
    }
  };

  const handleFinish = async (values) => {
    try {
      const generatedCode = `PN-${Math.floor(5520 + Math.random() * 80)}`;
      const combinedIssues = [
        ...selectedIssueTags,
        values.issueNotes ? values.issueNotes.trim() : '',
      ]
        .filter(Boolean)
        .join('; ');

      const newTicket = {
        key: `${Date.now()}`,
        code: generatedCode,
        customer: values.customerName,
        phone: values.phone,
        email: values.email || '—',
        deviceType: values.deviceType,
        device: values.deviceName,
        serial: values.serial || 'Chưa cung cấp',
        passcode: values.passcode || 'Không có',
        accessories: values.accessories || [],
        condition: values.condition || 'Bình thường, có xước nhẹ',
        customerIssue: combinedIssues || 'Khách yêu cầu kiểm tra tổng quát',
        receiveDate: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        appointmentDate: values.appointmentDate || 'Trong ngày hôm nay',
        priority: values.priority || 'Bình thường',
        technician: values.technician || 'Chưa phân công',
        status: 'Mới tiếp nhận',
        estimatedCost: values.estimatedCost || 0,
        deposit: values.deposit || 0,
        paymentStatus: (values.deposit || 0) > 0 ? `Đã cọc ${(values.deposit || 0).toLocaleString('vi-VN')} ₫` : 'Chưa thanh toán',
        items: [],
      };

      setPreviewTicket(newTicket);
      onSubmitTicket(newTicket);
      message.success(`Đã tiếp nhận thành công phiếu sửa chữa ${newTicket.code}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseAll = () => {
    setPreviewTicket(null);
    form.resetFields();
    setSelectedIssueTags([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LaptopOutlined style={{ color: '#1677ff', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>
              Phiếu tiếp nhận thiết bị sửa chữa mới
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 'normal' }}>
              Quy trình tiếp nhận máy minh bạch — Ghi nhận ngoại quan & Phân công kỹ thuật viên
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCloseAll}
      width={860}
      style={{ top: 20 }}
      footer={
        previewTicket
          ? [
              <Button key="close" onClick={handleCloseAll}>
                Đóng
              </Button>,
              <Button
                key="print"
                type="primary"
                icon={<PrinterOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={handlePrintReceipt}
              >
                In biên nhận bàn giao khách (A5)
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={handleCloseAll}>
                Hủy bỏ
              </Button>,
              <Button
                key="submit"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => form.submit()}
              >
                Tạo phiếu tiếp nhận & Phân công
              </Button>,
            ]
      }
    >
      {previewTicket ? (
        <Card
          size="small"
          style={{
            border: '2px dashed #1677ff',
            background: '#fafafa',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#1677ff' }}>TRUNG TÂM SỬA CHỮA CÔNG NGHỆ TECHFIX</h3>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Hotline: 1900 6868 • Địa chỉ: 123 Cầu Giấy, Hà Nội</div>
            <h4 style={{ margin: '8px 0 2px 0', textTransform: 'uppercase' }}>
              BIÊN NHẬN THIẾT BỊ BẢO TRÌ & SỬA CHỮA
            </h4>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#cf1322' }}>
              MÃ PHIẾU: {previewTicket.code}
            </div>
          </div>

          <Row gutter={[16, 8]}>
            <Col span={12}>
              <div><strong>Khách hàng:</strong> {previewTicket.customer} ({previewTicket.phone})</div>
              <div><strong>Thiết bị:</strong> {previewTicket.device} (Loại: {previewTicket.deviceType})</div>
              <div><strong>Số Serial/IMEI:</strong> {previewTicket.serial}</div>
              <div><strong>Mật khẩu máy:</strong> {previewTicket.passcode}</div>
            </Col>
            <Col span={12}>
              <div><strong>Thời gian tiếp nhận:</strong> {previewTicket.receiveDate}</div>
              <div><strong>Hẹn trả máy:</strong> <Tag color="red">{previewTicket.appointmentDate}</Tag></div>
              <div><strong>Kỹ thuật viên phụ trách:</strong> <Tag color="blue">{previewTicket.technician}</Tag></div>
              <div><strong>Tiền đặt cọc:</strong> <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{previewTicket.deposit.toLocaleString('vi-VN')} ₫</span></div>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0' }} />

          <div>
            <strong>Phụ kiện kèm theo:</strong>{' '}
            {previewTicket.accessories.length > 0 ? previewTicket.accessories.join(', ') : 'Không có phụ kiện kèm theo'}
          </div>
          <div>
            <strong>Tình trạng ngoại quan:</strong> {previewTicket.condition}
          </div>
          <div style={{ marginTop: '4px', background: '#fffbe6', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ffe58f' }}>
            <strong>Mô tả lỗi ban đầu của khách:</strong> {previewTicket.customerIssue}
          </div>

          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '12px', fontStyle: 'italic', textAlign: 'center' }}>
            * Khách hàng vui lòng giữ biên nhận này để đối chiếu khi nhận lại máy. Mọi can thiệp phát sinh sẽ được KTV gọi điện xin duyệt trước khi xử lý.
          </div>
        </Card>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            deviceType: 'Laptop',
            priority: 'Bình thường',
            deposit: 0,
            appointmentDate: '17:30 (Hôm nay)',
            condition: 'Máy có trầy xước nhẹ mặt đáy, màn hình nguyên vẹn',
          }}
          style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}
          onFinish={handleFinish}
        >
          {/* Thông tin khách hàng */}
          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: '13px', color: '#1677ff' }}>
            1. THÔNG TIN KHÁCH HÀNG
          </Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="customerName"
                label={<span style={{ fontWeight: 600 }}>Họ và tên khách hàng</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên khách!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="VD: Nguyễn Văn Nam" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại liên hệ</span>}
                rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="VD: 0912 345 678" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="email" label={<span style={{ fontWeight: 600 }}>Email (Nhận hóa đơn điện tử)</span>}>
                <Input placeholder="VD: nam.nguyen@gmail.com" />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin thiết bị */}
          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: '13px', color: '#1677ff' }}>
            2. THÔNG TIN THIẾT BỊ & PHỤ KIỆN
          </Divider>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="deviceType" label={<span style={{ fontWeight: 600 }}>Loại thiết bị</span>} rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'Laptop', label: '💻 Laptop Windows' },
                    { value: 'MacBook', label: '🍏 MacBook' },
                    { value: 'PC', label: '🖥️ PC Gaming / Văn phòng' },
                    { value: 'Máy in', label: '🖨️ Máy in / Thiết bị VP' },
                    { value: 'Điện thoại/iPad', label: '📱 Tablet / iPad' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                name="deviceName"
                label={<span style={{ fontWeight: 600 }}>Model thiết bị chính xác</span>}
                rules={[{ required: true, message: 'Nhập model máy!' }]}
              >
                <Input placeholder="VD: Dell Inspiron 5510 hoặc MacBook Pro 14 M1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="serial" label={<span style={{ fontWeight: 600 }}>Số Serial / Service Tag</span>}>
                <Input placeholder="VD: DELL-7821-VN hoặc C02GK91..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="passcode" label={<span style={{ fontWeight: 600 }}>Mật khẩu mở máy (Để KTV test QC)</span>}>
                <Input placeholder="VD: 123456 hoặc Không có" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="condition" label={<span style={{ fontWeight: 600 }}>Tình trạng ngoại quan lúc nhận</span>}>
                <Input placeholder="Ghi nhận xước xát, cấn móp, tem ốc còn nguyên..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="accessories" label={<span style={{ fontWeight: 600 }}>Phụ kiện gửi kèm theo máy:</span>}>
            <Checkbox.Group options={ACCESSORY_OPTIONS} />
          </Form.Item>

          {/* Mô tả lỗi ban đầu */}
          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: '13px', color: '#1677ff' }}>
            3. KHAI BÁO TÌNH TRẠNG LỖI BAN ĐẦU CỦA KHÁCH
          </Divider>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Chọn nhanh hiện tượng phổ biến:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {COMMON_ISSUES.map((issue) => {
                const isSelected = selectedIssueTags.includes(issue);
                return (
                  <Tag.CheckableTag
                    key={issue}
                    checked={isSelected}
                    onChange={() => handleToggleIssue(issue)}
                    style={{
                      borderRadius: '12px',
                      padding: '4px 10px',
                      border: isSelected ? '1px solid #1677ff' : '1px dashed #d9d9d9',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {issue}
                  </Tag.CheckableTag>
                );
              })}
            </div>
          </div>

          <Form.Item name="issueNotes" label={<span style={{ fontWeight: 600 }}>Ghi chú lỗi chi tiết của khách hàng:</span>}>
            <Input.TextArea rows={2} placeholder="Mô tả hoàn cảnh xuất hiện lỗi: sau khi cắm máy chiếu, quạt rít, tắt đột ngột lúc chơi game..." />
          </Form.Item>

          {/* Phân công & Lịch hẹn */}
          <Divider orientation="left" style={{ margin: '8px 0 16px 0', fontSize: '13px', color: '#1677ff' }}>
            4. PHÂN CÔNG KỸ THUẬT & HẸN TRẢ MÁY
          </Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="technician" label={<span style={{ fontWeight: 600 }}>Kỹ thuật viên phụ trách:</span>}>
                <Select
                  placeholder="Chọn KTV"
                  options={TECHNICIANS_LIST.map((t) => ({
                    value: t.name,
                    label: `${t.name} (${t.specialty}) - Đang làm ${t.activeJobs} ca`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="appointmentDate" label={<span style={{ fontWeight: 600 }}>Thời gian hẹn trả máy:</span>}>
                <Input prefix={<ClockCircleOutlined />} placeholder="VD: 17:30 hôm nay hoặc 10:00 ngày mai" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="priority" label={<span style={{ fontWeight: 600 }}>Mức độ ưu tiên:</span>}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="Bình thường">Bình thường</Radio.Button>
                  <Radio.Button value="Khẩn cấp" style={{ color: '#ff4d4f' }}>
                    ⚡ Khẩn cấp
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="estimatedCost" label={<span style={{ fontWeight: 600 }}>Dự toán chi phí sơ bộ (₫):</span>}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  step={50000}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="deposit" label={<span style={{ fontWeight: 600 }}>Tiền khách cọc trước (₫):</span>}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  step={50000}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default IntakeModal;
