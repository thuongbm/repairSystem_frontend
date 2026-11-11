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
  'Màn hình sọc / Không hiển thị',
  'Liệt phím / Kẹt nút',
  'Không nhận sạc / Chân lỏng',
  'Ẩm nước / Đổ chất lỏng',
  'Chạy chậm / Nhiễm mã độc',
  'Nâng cấp RAM / SSD',
];

const ACCESSORY_OPTIONS = [
  'Củ sạc / Dây nguồn',
  'Túi chống sốc',
  'Chuột rời / USB Receiver',
  'Cáp kết nối',
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
        appointmentDate: values.appointmentDate || 'Trong ngày',
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
      message.success(`Đã tiếp nhận phiếu ${newTicket.code}`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            <LaptopOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
              Tiếp nhận thiết bị mới
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCloseAll}
      width={800}
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
                onClick={handlePrintReceipt}
              >
                In phiếu tiếp nhận
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
                Tạo phiếu tiếp nhận
              </Button>,
            ]
      }
    >
      {previewTicket ? (
        <Card
          size="small"
          style={{
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>TRUNG TÂM SỬA CHỮA CÔNG NGHỆ TECHFIX</h4>
            <div style={{ fontSize: '12px', color: '#64748b' }}>123 Cầu Giấy, Hà Nội • Hotline: 1900 6868</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb', marginTop: '8px' }}>
              PHIẾU TIẾP NHẬN: {previewTicket.code}
            </div>
          </div>

          <Row gutter={[16, 8]} style={{ fontSize: '13px' }}>
            <Col span={12}>
              <div><strong>Khách hàng:</strong> {previewTicket.customer} ({previewTicket.phone})</div>
              <div><strong>Thiết bị:</strong> {previewTicket.device} ({previewTicket.deviceType})</div>
              <div><strong>Serial/IMEI:</strong> {previewTicket.serial}</div>
              <div><strong>Mật khẩu:</strong> {previewTicket.passcode}</div>
            </Col>
            <Col span={12}>
              <div><strong>Thời gian nhận:</strong> {previewTicket.receiveDate}</div>
              <div><strong>Hẹn trả:</strong> {previewTicket.appointmentDate}</div>
              <div><strong>Kỹ thuật viên:</strong> {previewTicket.technician}</div>
              <div><strong>Đặt cọc:</strong> {previewTicket.deposit.toLocaleString('vi-VN')} ₫</div>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ fontSize: '13px' }}>
            <div><strong>Phụ kiện:</strong> {previewTicket.accessories.length > 0 ? previewTicket.accessories.join(', ') : 'Không có'}</div>
            <div style={{ marginTop: '4px' }}><strong>Ngoại quan:</strong> {previewTicket.condition}</div>
            <div style={{ marginTop: '4px' }}><strong>Mô tả sự cố:</strong> {previewTicket.customerIssue}</div>
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
            condition: 'Máy trầy xước nhẹ mặt đáy, màn hình nguyên vẹn',
          }}
          style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}
          onFinish={handleFinish}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            1. Thông tin khách hàng
          </div>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="customerName"
                label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Họ và tên</span>}
                rules={[{ required: true, message: 'Nhập tên khách hàng' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn Nam" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Số điện thoại</span>}
                rules={[{ required: true, message: 'Nhập số điện thoại' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0912 345 678" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="email" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Email</span>}>
                <Input placeholder="nam.nguyen@gmail.com" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 12px 0' }}>
            2. Thông tin thiết bị
          </div>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="deviceType" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Loại máy</span>} rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'Laptop', label: 'Laptop Windows' },
                    { value: 'MacBook', label: 'MacBook / macOS' },
                    { value: 'PC', label: 'PC Workstation / Desktop' },
                    { value: 'Máy in', label: 'Máy in / Ngoại vi' },
                    { value: 'Điện thoại/iPad', label: 'Tablet / iPad' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                name="deviceName"
                label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Model thiết bị</span>}
                rules={[{ required: true, message: 'Nhập model máy' }]}
              >
                <Input placeholder="Dell Inspiron 5510 / MacBook Pro M1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="serial" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Serial / Service Tag</span>}>
                <Input placeholder="DELL-7821-VN" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="passcode" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Mật khẩu máy</span>}>
                <Input placeholder="123456 hoặc Không có" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="condition" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Tình trạng ngoại quan</span>}>
                <Input placeholder="Ghi nhận trầy xước, cấn móp, tem ốc..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="accessories" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Phụ kiện kèm theo</span>}>
            <Checkbox.Group options={ACCESSORY_OPTIONS} />
          </Form.Item>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 12px 0' }}>
            3. Tình trạng lỗi
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {COMMON_ISSUES.map((issue) => {
              const isSelected = selectedIssueTags.includes(issue);
              return (
                <Tag.CheckableTag
                  key={issue}
                  checked={isSelected}
                  onChange={() => handleToggleIssue(issue)}
                  style={{
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '12px',
                    border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  }}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {issue}
                </Tag.CheckableTag>
              );
            })}
          </div>

          <Form.Item name="issueNotes" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Ghi chú lỗi chi tiết</span>}>
            <Input.TextArea rows={2} placeholder="Mô tả hoàn cảnh xuất hiện lỗi..." />
          </Form.Item>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 12px 0' }}>
            4. Phân công & Lịch hẹn
          </div>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="technician" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Kỹ thuật viên phụ trách</span>}>
                <Select
                  placeholder="Chọn KTV"
                  options={TECHNICIANS_LIST.map((t) => ({
                    value: t.name,
                    label: `${t.name} (${t.specialty})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="appointmentDate" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Thời gian hẹn trả máy</span>}>
                <Input prefix={<ClockCircleOutlined />} placeholder="17:30 hôm nay hoặc ngày mai" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="priority" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Độ ưu tiên</span>}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="Bình thường">Bình thường</Radio.Button>
                  <Radio.Button value="Khẩn cấp">Khẩn cấp</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="estimatedCost" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Dự toán sơ bộ (₫)</span>}>
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
              <Form.Item name="deposit" label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Tiền cọc trước (₫)</span>}>
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