import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, Row, Col, Typography, Table, Select, Switch, Avatar, Space, Tag, 
  Button, Input, Modal, Form, message, Alert, Spin, Tooltip 
} from 'antd';
import { 
  CheckOutlined, 
  SafetyCertificateOutlined, 
  ReloadOutlined, 
  UserAddOutlined, 
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Title, Text } = Typography;

// Cấu hình hiển thị theo vai trò (khớp mã trong Database & Backend)
const ROLE_CONFIG = {
  ADMIN: { label: 'Quản trị viên', color: 'red', tagColor: 'error' },
  LE_TAN: { label: 'Lễ tân', color: 'blue', tagColor: 'processing' },
  THU_KHO: { label: 'Thủ kho', color: 'gold', tagColor: 'warning' },
  KY_THUAT_VIEN: { label: 'Kỹ thuật viên', color: 'green', tagColor: 'success' },
  KHACH_HANG: { label: 'Khách hàng', color: 'purple', tagColor: 'default' },
};

// Hàm lấy chữ cái đầu cho Avatar
const getInitials = (name) => {
  if (!name) return 'NV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Định dạng thời gian hoạt động / đăng nhập cuối
const formatActivity = (lastLogin, updatedAt) => {
  const targetDate = lastLogin || updatedAt;
  if (!targetDate) return 'Chưa đăng nhập';
  try {
    const d = new Date(targetDate);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Đang hoạt động';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return 'Chưa đăng nhập';
  }
};

const HR = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [form] = Form.useForm();
  const selectedRoleInForm = Form.useWatch('chucVu', form);

  // Lấy dữ liệu thật từ Database qua Backend API
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const res = await api.getNhanVien({ includeDeleted: false });
      const data = res?.data || res || [];
      if (Array.isArray(data)) {
        setStaffList(data);
      } else {
        setStaffList([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân sự:', err);
      message.error(err.response?.data?.message || 'Không thể tải danh sách nhân sự từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Bật / tắt quyền truy cập của tài khoản (gọi API thật)
  const handleToggleAccess = async (record, checked) => {
    if (!record.taiKhoanId) {
      message.warning('Nhân viên này chưa liên kết với tài khoản hệ thống.');
      return;
    }

    setTogglingId(record.id);
    try {
      await api.capNhatTrangThaiTaiKhoan(record.taiKhoanId, checked);
      message.success(`Đã ${checked ? 'mở khóa' : 'vô hiệu hóa'} tài khoản "${record.tenDangNhap || record.hoTen}".`);
      
      // Cập nhật state nội bộ
      setStaffList((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, hoatDong: checked } : item
        )
      );
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      message.error(err.response?.data?.message || 'Cập nhật trạng thái tài khoản thất bại.');
    } finally {
      setTogglingId(null);
    }
  };

  // Tạo nhân viên & tài khoản mới vào Database
  const handleCreateStaff = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        hoTen: values.hoTen.trim(),
        soDienThoai: values.soDienThoai.trim(),
        email: values.email?.trim() || null,
        chucVu: values.chucVu,
        chuyenMon: values.chucVu === 'KY_THUAT_VIEN' ? (values.chuyenMon?.trim() || null) : null,
        tenDangNhap: values.tenDangNhap.trim(),
        matKhau: values.matKhau,
      };

      const res = await api.taoNhanVien(payload);
      message.success(res?.message || 'Tạo nhân viên và tài khoản thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchStaffData();
    } catch (err) {
      console.error('Lỗi tạo nhân viên:', err);
      message.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Tạo nhân viên thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Lọc dữ liệu hiển thị theo tìm kiếm & vai trò
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      const matchRole = selectedRoleFilter === 'ALL' || item.chucVu === selectedRoleFilter;
      const query = searchText.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.hoTen?.toLowerCase().includes(query) ||
        item.tenDangNhap?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.soDienThoai?.includes(query) ||
        item.maNv?.toLowerCase().includes(query);
      return matchRole && matchSearch;
    });
  }, [staffList, searchText, selectedRoleFilter]);

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => {
        const initials = getInitials(record.hoTen);
        return (
          <Space size="middle">
            <Avatar 
              style={{ 
                backgroundColor: '#eff6ff', 
                color: '#2563eb', 
                border: '1px solid #bfdbfe',
                fontWeight: 600
              }}
            >
              {initials}
            </Avatar>
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {record.hoTen}
                {record.maNv && (
                  <Tag color="geekblue" style={{ marginLeft: 8, fontSize: 11, borderRadius: 4 }}>
                    {record.maNv}
                  </Tag>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 2 }}>
                {record.tenDangNhap && (
                  <span title="Tên đăng nhập">
                    <UserOutlined style={{ marginRight: 3 }} />
                    <strong>{record.tenDangNhap}</strong>
                  </span>
                )}
                {record.email && (
                  <span title="Email">
                    <MailOutlined style={{ marginRight: 3 }} />
                    {record.email}
                  </span>
                )}
                {record.soDienThoai && (
                  <span title="Số điện thoại">
                    <PhoneOutlined style={{ marginRight: 3 }} />
                    {record.soDienThoai}
                  </span>
                )}
              </div>
              {record.chuyenMon && (
                <div style={{ fontSize: '12px', color: '#059669', marginTop: 2 }}>
                  🔧 Chuyên môn: {record.chuyenMon}
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Vai trò',
      dataIndex: 'chucVu',
      key: 'chucVu',
      width: 150,
      render: (chucVu) => {
        const config = ROLE_CONFIG[chucVu] || { label: chucVu, tagColor: 'default' };
        return (
          <Tag color={config.tagColor} style={{ fontWeight: 500, padding: '2px 8px', borderRadius: 6 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Hoạt động',
      key: 'activity',
      width: 140,
      render: (_, record) => {
        const activityText = formatActivity(record.dangNhapCuoi, record.updatedAt);
        const isActiveNow = activityText === 'Đang hoạt động';
        return (
          <Text style={{ color: isActiveNow ? '#10b981' : '#6b7280', fontSize: '13px' }}>
            {activityText}
          </Text>
        );
      },
    },
    {
      title: 'Truy cập',
      key: 'access',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const isAccessActive = record.hoatDong !== undefined ? record.hoatDong : true;
        const isSelf = record.tenDangNhap === 'admin';
        return (
          <Tooltip title={isSelf ? 'Không thể khóa tài khoản Admin chính' : (isAccessActive ? 'Tài khoản đang hoạt động' : 'Tài khoản đang bị khóa')}>
            <Switch
              checked={isAccessActive}
              disabled={isSelf || togglingId === record.id}
              loading={togglingId === record.id}
              onChange={(checked) => handleToggleAccess(record, checked)}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <Row gutter={24}>
        <Col span={16}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Title level={4} style={{ margin: 0 }}>Tài khoản nhân sự</Title>
                  <Tag color="blue">{filteredStaff.length} tài khoản</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Danh sách tài khoản nhân viên được tải trực tiếp từ cơ sở dữ liệu hệ thống.
                </Text>
              </div>

              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchStaffData} 
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />} 
                  onClick={() => setIsModalOpen(true)}
                >
                  Thêm nhân viên
                </Button>
              </Space>
            </div>

            {/* Bộ lọc & Tìm kiếm */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <Input
                placeholder="Tìm theo tên, mã NV, username, SĐT..."
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                style={{ width: 280, borderRadius: 6 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                value={selectedRoleFilter}
                style={{ width: 170 }}
                onChange={setSelectedRoleFilter}
                options={[
                  { label: 'Tất cả vai trò', value: 'ALL' },
                  { label: 'Quản trị viên', value: 'ADMIN' },
                  { label: 'Lễ tân', value: 'LE_TAN' },
                  { label: 'Thủ kho', value: 'THU_KHO' },
                  { label: 'Kỹ thuật viên', value: 'KY_THUAT_VIEN' },
                ]}
              />
            </div>

            {/* Bảng nhân sự */}
            <Table
              columns={columns}
              dataSource={filteredStaff}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 6, showTotal: (total) => `Tổng cộng ${total} nhân viên` }}
              rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
              locale={{ emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có nhân viên nào phù hợp' }}
            />
          </Card>
        </Col>

        {/* Cột ma trận phân quyền bên phải */}
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: '18px' }} />
              <Title level={4} style={{ margin: 0 }}>Ma trận phân quyền</Title>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px', fontSize: '13px' }}>
              Quyền hạn hệ thống phân theo từng vai trò nhân viên.
            </Text>

            <div style={{ marginBottom: '20px' }}>
              <Tag color="red" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <Space size={4}><UserIcon size={12} /> Quản trị viên (ADMIN)</Space>
              </Tag>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Quản trị toàn bộ nhân sự & phân quyền</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Xem báo cáo tài chính & doanh thu</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Cấu hình dịch vụ & bảng giá</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Quản lý danh mục & nhà cung cấp</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Tag color="blue" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <Space size={4}><UserIcon size={12} /> Lễ tân (LE_TAN)</Space>
              </Tag>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Tiếp nhận thiết bị & tạo phiếu sửa</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Quản lý lịch hẹn & điều phối ca</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Báo giá và thanh toán hóa đơn</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Tag color="gold" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <Space size={4}><UserIcon size={12} /> Thủ kho (THU_KHO)</Space>
              </Tag>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Quản lý danh mục linh kiện & tồn kho</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Lập & xác nhận phiếu nhập kho</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Giám sát cảnh báo hết hàng</div>
              </div>
            </div>

            <div>
              <Tag color="green" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <Space size={4}><UserIcon size={12} /> Kỹ thuật viên (KY_THUAT_VIEN)</Space>
              </Tag>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Xem các phiếu được phân công</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Cập nhật chẩn đoán & đề xuất linh kiện</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '13px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Cập nhật tiến độ sửa chữa</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal Thêm nhân viên mới */}
      <Modal
        title="Thêm nhân viên & tạo tài khoản mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateStaff}
          initialValues={{ chucVu: 'KY_THUAT_VIEN' }}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="hoTen"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên nhân viên!' }]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn An" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="soDienThoai"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9+ ]{8,15}$/, message: 'Số điện thoại gồm 8-15 chữ số!' },
                ]}
              >
                <Input placeholder="Ví dụ: 0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
              >
                <Input placeholder="Ví dụ: an.nv@techfix.vn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chức vụ / Vai trò"
                name="chucVu"
                rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
              >
                <Select
                  options={[
                    { label: 'Quản trị viên (ADMIN)', value: 'ADMIN' },
                    { label: 'Lễ tân (LE_TAN)', value: 'LE_TAN' },
                    { label: 'Thủ kho (THU_KHO)', value: 'THU_KHO' },
                    { label: 'Kỹ thuật viên (KY_THUAT_VIEN)', value: 'KY_THUAT_VIEN' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedRoleInForm === 'KY_THUAT_VIEN' && (
            <Form.Item
              label="Chuyên môn kỹ thuật"
              name="chuyenMon"
            >
              <Input placeholder="Ví dụ: Sửa Mainboard, Khò hàn chip, Phần mềm..." />
            </Form.Item>
          )}

          <div style={{ background: '#f9fafb', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 12, color: '#374151' }}>
              🔑 Thông tin tài khoản đăng nhập
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="tenDangNhap"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                    { min: 4, message: 'Tối thiểu 4 ký tự!' },
                    { pattern: /^[a-zA-Z0-9_.]+$/, message: 'Chỉ gồm chữ, số, dấu . hoặc _' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Ví dụ: ktv_an" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mật khẩu khởi tạo"
                  name="matKhau"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input.Password placeholder="Tối thiểu 6 ký tự" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Tạo nhân viên
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

const UserIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default HR;
