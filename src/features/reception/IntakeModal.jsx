import { useState, useEffect } from 'react';
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
  DatePicker,
  Card,
  Alert,
  Space,
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
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import IntakeConfirmationPanel from './IntakeConfirmationPanel';

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
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [selectedIssueTags, setSelectedIssueTags] = useState([]);
  const [previewTicket, setPreviewTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lookingUpDevice, setLookingUpDevice] = useState(false);
  const [foundDevice, setFoundDevice] = useState(null);
  const [reusedDevice, setReusedDevice] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const serialValue = Form.useWatch('serial', form);

  const checklistFields = [
    { name: 'manHinh', label: 'Màn hình', options: [
      ['BINH_THUONG', 'Bình thường'], ['TRAY_XUOC', 'Trầy xước'],
      ['VO_HONG', 'Vỡ / hỏng'], ['KHONG_KIEM_TRA', 'Chưa kiểm tra']] },
    { name: 'voMay', label: 'Vỏ máy', options: [
      ['BINH_THUONG', 'Bình thường'], ['TRAY_XUOC', 'Trầy xước'],
      ['VO_HONG', 'Vỡ / hỏng'], ['KHONG_KIEM_TRA', 'Chưa kiểm tra']] },
    { name: 'nguon', label: 'Nguồn', options: [
      ['BAT_DUOC', 'Bật được'], ['KHONG_BAT_DUOC', 'Không bật được'],
      ['KHONG_KIEM_TRA', 'Chưa kiểm tra']] },
    { name: 'temOc', label: 'Tem / ốc', options: [
      ['NGUYEN_VEN', 'Nguyên vẹn'], ['HONG_THIEU', 'Hỏng / thiếu'],
      ['KHONG_KIEM_TRA', 'Chưa kiểm tra']] },
    { name: 'dauHieuNuoc', label: 'Dấu hiệu vào nước', options: [
      ['CO', 'Có'], ['KHONG', 'Không'], ['KHONG_KIEM_TRA', 'Chưa kiểm tra']] },
  ];

  // Danh sách KTV thật (kèm số ca đang làm) để phân công khi tiếp nhận
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    api
      .getKyThuatVienPhanCong()
      .then((res) => {
        const data = res?.data || [];
        if (!cancelled) setTechnicians(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) message.warning('Không tải được danh sách kỹ thuật viên. Bạn vẫn có thể tiếp nhận và phân công sau.');
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || user?.role !== 'admin') return;
    let active = true;
    api.getNhanVien({ chucVu: 'LE_TAN' })
      .then((res) => { if (active) setReceptionists(res.data || []); })
      .catch(() => message.error('Không tải được danh sách lễ tân.'));
    return () => { active = false; };
  }, [visible, user?.role]);

  const handleToggleIssue = (issue) => {
    if (selectedIssueTags.includes(issue)) {
      setSelectedIssueTags(selectedIssueTags.filter((i) => i !== issue));
    } else {
      setSelectedIssueTags([...selectedIssueTags, issue]);
    }
  };

  const lookupDevice = async () => {
    const serial = form.getFieldValue('serial')?.trim();
    if (!serial) { message.warning('Nhập serial trước khi tra cứu máy cũ.'); return; }
    setLookingUpDevice(true);
    setFoundDevice(null);
    try {
      const result = (await api.traCuuThietBiTheoSerial(serial)).data;
      setFoundDevice(result);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không tra cứu được thiết bị.');
    } finally { setLookingUpDevice(false); }
  };

  const useExistingDevice = () => {
    if (!foundDevice) return;
    form.setFieldsValue({
      thietBiId: foundDevice.thietBiId,
      customerName: foundDevice.customerName,
      phone: foundDevice.phone,
      email: foundDevice.email || undefined,
      deviceType: foundDevice.loaiMay,
      deviceName: foundDevice.tenThietBi,
      serial: foundDevice.soSerial,
    });
    setReusedDevice(foundDevice);
    setFoundDevice(null);
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const combinedIssues = [
        ...selectedIssueTags,
        values.issueNotes ? values.issueNotes.trim() : '',
      ]
        .filter(Boolean)
        .join('; ');
      if (!combinedIssues) {
        message.warning('Chọn ít nhất một hiện tượng hoặc ghi lỗi khách mô tả.');
        return;
      }

      // Thông tin chưa có cột riêng được lưu vào ghi chú phiếu.
      const ghiChuParts = [];
      if (values.priority === 'Khẩn cấp') ghiChuParts.push('Ưu tiên: KHẨN CẤP');
      if ((values.estimatedCost || 0) > 0) {
        ghiChuParts.push(`Dự toán sơ bộ: ${Number(values.estimatedCost).toLocaleString('vi-VN')} đ`);
      }

      // POST /api/phieu-sua-chua (Giai đoạn 3 - Mục 3.3)
      const payload = {
        thietBiId: values.thietBiId || null,
        customerName: values.customerName?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim() || null,
        deviceType: values.deviceType,
        deviceName: values.deviceName?.trim(),
        soSerial: values.serial?.trim() || null,
        lyDoKhongSerial: values.serial?.trim() ? null : values.noSerialReason?.trim(),
        kyThuatVienId: values.technician || null,
        leTanId: user?.role === 'admin' ? values.leTanId : null,
        tinhTrangLoi: combinedIssues,
        tinhTrangNgoaiQuan: values.condition?.trim(),
        phuKienKemTheo: values.accessories?.length > 0
          ? values.accessories.join(', ') : 'KHONG_CO',
        checklistTiepNhan: values.checklist,
        matKhauMay: values.passcode?.trim() || null,
        ngayHenTra: values.appointmentDate ? values.appointmentDate.toISOString() : null,
        ghiChu: ghiChuParts.length > 0 ? ghiChuParts.join('; ') : null,
      };

      // Nếu API lỗi thì ném lỗi ra catch bên dưới: KHÔNG tạo phiếu/mã phiếu giả
      const res = await api.taoPhieuSuaChua(payload);
      const bePhieu = res?.data;
      if (!bePhieu?.maPhieu) {
        throw new Error('Máy chủ không trả về mã phiếu. Phiếu chưa được lưu.');
      }
      let recordedDeposit = 0;
      if (Number(values.deposit) > 0) {
        try {
          await api.ghiGiaoDichV3(bePhieu.id, {
            hoaDonId: null, loai: 'THU', soTien: Number(values.deposit),
            phuongThuc: 'TIEN_MAT', ghiChu: 'Cọc khi tiếp nhận'
          });
          recordedDeposit = Number(values.deposit);
        } catch (depositError) {
          message.warning(`Phiếu ${bePhieu.maPhieu} đã lưu, nhưng chưa ghi được tiền cọc: ${depositError.response?.data?.message || depositError.message}`);
        }
      }
      const technicianName =
        technicians.find((t) => t.id === values.technician)?.hoTen || 'Chưa phân công';

      const newTicket = {
        id: bePhieu.id,
        key: `${bePhieu.id}`,
        code: bePhieu.maPhieu,
        customer: values.customerName,
        phone: values.phone,
        email: values.email || '—',
        deviceType: values.deviceType,
        device: values.deviceName,
        serial: values.serial || 'Chưa cung cấp',
        noSerialReason: values.serial?.trim() ? null : values.noSerialReason?.trim(),
        checklist: values.checklist,
        accessories: values.accessories || [],
        condition: values.condition,
        customerIssue: combinedIssues,
        receiveDate: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        appointmentDate: values.appointmentDate
          ? values.appointmentDate.format('HH:mm DD/MM/YYYY')
          : 'Chưa hẹn giờ trả',
        priority: values.priority || 'Bình thường',
        technician: technicianName,
        status: 'Mới tiếp nhận',
        estimatedCost: values.estimatedCost || 0,
        deposit: recordedDeposit,
        paymentStatus: recordedDeposit > 0 ? `Đã cọc ${recordedDeposit.toLocaleString('vi-VN')} ₫` : 'Chưa thanh toán',
        items: [],
      };

      setPreviewTicket(newTicket);
      onSubmitTicket(newTicket);
      message.success(`Đã tạo phiếu ${newTicket.code}. Hãy tải ảnh và ghi nhận biên nhận đã ký.`);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message ||
          err.message ||
          'Không thể tạo phiếu tiếp nhận. Vui lòng kiểm tra lại thông tin và thử lại!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseAll = () => {
    setPreviewTicket(null);
    setFoundDevice(null);
    setReusedDevice(null);
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
                loading={submitting}
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
                loading={submitting}
                icon={<CheckCircleOutlined />}
                onClick={() => form.submit()}
              >
                Tạo phiếu tiếp nhận & Phân công
              </Button>,
            ]
      }
    >
      {previewTicket ? (<>
        <Card
          id="intake-print-receipt"
          size="small"
          style={{
            border: '2px dashed #1677ff',
            background: '#fafafa',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#1677ff' }}>BIÊN NHẬN TIẾP NHẬN THIẾT BỊ</h3>
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
              {previewTicket.noSerialReason && <div><strong>Không có serial:</strong> {previewTicket.noSerialReason}</div>}
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
          <div><strong>Checklist:</strong> {checklistFields.map((field) => {
            const value = previewTicket.checklist?.[field.name];
            const label = field.options.find(([code]) => code === value)?.[1] || value;
            return `${field.label}: ${label}`;
          }).join('; ')}</div>
          <div style={{ marginTop: '4px', background: '#fffbe6', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ffe58f' }}>
            <strong>Mô tả lỗi ban đầu của khách:</strong> {previewTicket.customerIssue}
          </div>

          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '12px', fontStyle: 'italic', textAlign: 'center' }}>
            * Khách hàng vui lòng giữ biên nhận này để đối chiếu khi nhận lại máy. Mọi can thiệp phát sinh sẽ được KTV gọi điện xin duyệt trước khi xử lý.
          </div>
          <Row style={{ marginTop: 24, textAlign: 'center' }}>
            <Col span={12}><strong>Khách hàng xác nhận</strong><br /><small>(Ký, ghi rõ họ tên)</small>
              <div style={{ height: 65 }} /></Col>
            <Col span={12}><strong>Nhân viên tiếp nhận</strong><br /><small>(Ký, ghi rõ họ tên)</small></Col>
          </Row>
        </Card>
        <Alert style={{ marginTop: 12 }} type="info" showIcon
          message="In biên nhận, để khách kiểm tra và ký, sau đó tải ảnh đã ký lên hệ thống." />
        <div style={{ marginTop: 12 }}>
          <IntakeConfirmationPanel ticketId={previewTicket.id} ticketStatus="TIEP_NHAN"
            onConfirmed={() => onSubmitTicket(previewTicket)} />
        </div>
      </>) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            deviceType: 'Laptop',
            priority: 'Bình thường',
            deposit: 0,
            accessories: [],
          }}
          style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}
          onFinish={handleFinish}
          onValuesChange={(changed) => {
            if (Object.hasOwn(changed, 'serial')) {
              form.setFieldValue('thietBiId', null);
              setFoundDevice(null);
              setReusedDevice(null);
            }
          }}
        >
          <Form.Item name="thietBiId" hidden><Input /></Form.Item>
          {user?.role === 'admin' && <Form.Item name="leTanId" label="Lễ tân tiếp nhận"
            rules={[{ required: true, message: 'Chọn lễ tân để tiếp nhận.' }]}>
            <Select options={receptionists.map((x) => ({ value: x.id, label: x.hoTen }))} />
          </Form.Item>}
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
              <Form.Item name="email" label={<span style={{ fontWeight: 600 }}>Email liên hệ</span>}>
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

          <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
            <Button onClick={lookupDevice} loading={lookingUpDevice}>Tra cứu máy đã sửa theo serial</Button>
            {foundDevice && <Alert type="info" showIcon
              message={`${foundDevice.maThietBi} — ${foundDevice.tenThietBi}`}
              description={<Space direction="vertical">
                <span>Hồ sơ khách: {foundDevice.customerName} · {foundDevice.phone}. Hãy xác minh khách trước khi dùng hồ sơ cũ.</span>
                <Button type="primary" onClick={useExistingDevice}>Dùng hồ sơ máy này để tạo phiếu mới</Button>
              </Space>} />}
            {reusedDevice && <Alert type="success" showIcon
              message={`Đang dùng máy cũ ${reusedDevice.maThietBi}; hệ thống sẽ tạo phiếu sửa mới.`} />}
          </Space>

          {!serialValue?.trim() && <Form.Item name="noSerialReason" label="Lý do không có serial"
            rules={[{ required: true, whitespace: true, message: 'Nhập lý do để dùng mã thiết bị nội bộ.' }]}>
            <Input maxLength={250} placeholder="Ví dụ: tem serial đã bong, không đọc được" />
          </Form.Item>}

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="passcode" label={<span style={{ fontWeight: 600 }}>Mật khẩu mở máy (Để KTV test QC)</span>}>
                <Input placeholder="VD: 123456 hoặc Không có" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="condition" label={<span style={{ fontWeight: 600 }}>Tình trạng ngoại quan lúc nhận</span>}
                rules={[{ required: true, whitespace: true, message: 'Ghi tình trạng thực tế lúc nhận.' }]}>
                <Input maxLength={500} placeholder="Ghi nhận xước xát, cấn móp, tem ốc còn nguyên..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="accessories" label={<span style={{ fontWeight: 600 }}>Phụ kiện gửi kèm theo máy:</span>}>
            <Checkbox.Group options={ACCESSORY_OPTIONS} />
          </Form.Item>

          <Divider orientation="left">Checklist tình trạng đầu vào</Divider>
          <Row gutter={12}>{checklistFields.map((field) => <Col xs={24} md={12} key={field.name}>
            <Form.Item name={['checklist', field.name]} label={field.label}
              rules={[{ required: true, message: `Chọn tình trạng ${field.label.toLowerCase()}.` }]}>
              <Select placeholder="Chọn tình trạng thực tế"
                options={field.options.map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          </Col>)}</Row>

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
                  placeholder="Chọn KTV (để trống = phân công sau)"
                  allowClear
                  options={technicians.map((t) => ({
                    value: t.id,
                    label: `${t.hoTen}${t.chuyenMon ? ` (${t.chuyenMon})` : ''} - Đang làm ${t.soCaDangLam} ca`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="appointmentDate" label={<span style={{ fontWeight: 600 }}>Thời gian hẹn trả máy:</span>}>
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  suffixIcon={<ClockCircleOutlined />}
                  placeholder="Chọn ngày giờ hẹn trả"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
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
