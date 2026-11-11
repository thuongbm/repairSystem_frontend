import { useState } from 'react';
import { Card, Row, Col, Typography, Table, Select, Switch, Avatar, Space, Tag } from 'antd';
import { CheckOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const initialStaffData = [
  {
    key: '1',
    initials: 'ML',
    name: 'Trương Mỹ Linh',
    email: 'linh.tm@techfix.vn',
    role: 'Quản lý',
    activity: 'Đang hoạt động',
    access: true,
  },
  {
    key: '2',
    initials: 'TH',
    name: 'Đặng Thu Hà',
    email: 'ha.dt@techfix.vn',
    role: 'Lễ tân',
    activity: '5 phút trước',
    access: true,
  },
  {
    key: '3',
    initials: 'VH',
    name: 'Nguyễn Văn Hùng',
    email: 'hung.nv@techfix.vn',
    role: 'Kỹ thuật viên',
    activity: 'Đang hoạt động',
    access: true,
  },
  {
    key: '4',
    initials: 'QB',
    name: 'Trần Quốc Bảo',
    email: 'bao.tq@techfix.vn',
    role: 'Kỹ thuật viên',
    activity: '12 phút trước',
    access: true,
  },
  {
    key: '5',
    initials: 'MT',
    name: 'Lê Minh Tuấn',
    email: 'tuan.lm@techfix.vn',
    role: 'Kỹ thuật viên',
    activity: '2 ngày trước',
    access: false,
  },
];

const HR = () => {
  const [staffData, setStaffData] = useState(initialStaffData);

  const toggleAccess = (key, checked) => {
    setStaffData(prevData => prevData.map(item => 
      item.key === key ? { ...item, access: checked } : item
    ));
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }}>
            {record.initials}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select 
          defaultValue={role} 
          style={{ width: 140 }} 
          size="small"
          popupMatchSelectWidth={false}
          onChange={(value) => {
            setStaffData(prev => prev.map(item => item.key === record.key ? { ...item, role: value } : item));
          }}
          options={[
            { value: 'Quản lý', label: 'Quản lý' },
            { value: 'Lễ tân', label: 'Lễ tân' },
            { value: 'Kỹ thuật viên', label: 'Kỹ thuật viên' },
          ]}
        />
      ),
    },
    {
      title: 'Hoạt động',
      dataIndex: 'activity',
      key: 'activity',
      render: (text) => (
        <Text style={{ color: text === 'Đang hoạt động' ? '#0f172a' : '#94a3b8', fontSize: '13px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Truy cập',
      key: 'access',
      render: (_, record) => (
        <Switch 
          checked={record.access} 
          size="small"
          onChange={(checked) => toggleAccess(record.key, checked)}
        />
      ),
    },
  ];

  return (
    <Row gutter={20}>
      <Col span={16}>
        <Card bordered={false} style={{ borderRadius: '8px', height: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Tài khoản nhân sự</Title>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={staffData} 
            pagination={false}
          />
        </Card>
      </Col>

      <Col span={8}>
        <Card bordered={false} style={{ borderRadius: '8px', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Ma trận phân quyền</Title>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Tag color="blue" style={{ borderRadius: '4px', marginBottom: '8px' }}>
              Quản lý
            </Tag>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Xem báo cáo & doanh thu</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Quản trị nhân sự & phân quyền</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Cấu hình bảng giá dịch vụ</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Điều phối & khóa khung giờ</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Tag color="cyan" style={{ borderRadius: '4px', marginBottom: '8px' }}>
              Lễ tân
            </Tag>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Tiếp nhận máy & tạo phiếu</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Điều phối lịch hẹn</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Báo giá cho khách</div>
            </div>
          </div>

          <div>
            <Tag color="green" style={{ borderRadius: '4px', marginBottom: '8px' }}>
              Kỹ thuật viên
            </Tag>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Xem phiếu được phân công</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckOutlined style={{ color: '#16a34a' }} /> Cập nhật trạng thái sửa chữa</div>
            </div>
          </div>

        </Card>
      </Col>
    </Row>
  );
};

export default HR;