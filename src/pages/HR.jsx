import React, { useState } from 'react';
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
          <Avatar style={{ backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}>
            {record.initials}
          </Avatar>
          <div>
            <div style={{ fontWeight: '500', color: '#1f2937' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{record.email}</div>
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
          bordered={false} 
          className="role-select" 
          popupMatchSelectWidth={false}
          onChange={(value) => {
            setStaffData(prev => prev.map(item => item.key === record.key ? { ...item, role: value } : item));
          }}
        >
          <Select.Option value="Quản lý">Quản lý</Select.Option>
          <Select.Option value="Lễ tân">Lễ tân</Select.Option>
          <Select.Option value="Kỹ thuật viên">Kỹ thuật viên</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Hoạt động',
      dataIndex: 'activity',
      key: 'activity',
      render: (text) => (
        <Text style={{ color: text === 'Đang hoạt động' ? '#4b5563' : '#9ca3af', fontStyle: text === 'Đang hoạt động' ? 'normal' : 'italic' }}>
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
          onChange={(checked) => toggleAccess(record.key, checked)}
        />
      ),
    },
  ];

  return (
    <Row gutter={24}>
      <Col span={16}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>Tài khoản nhân sự</Title>
            <Text type="secondary">Gán vai trò và bật/tắt quyền truy cập cho từng nhân viên.</Text>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={staffData} 
            pagination={false}
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
          />
        </Card>
      </Col>

      <Col span={8}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0 }}>Ma trận phân quyền</Title>
          </div>
          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
            Quyền hạn theo từng vai trò.
          </Text>

          <div style={{ marginBottom: '24px' }}>
            <Tag color="blue" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <Space size={4}><UserIcon size={12} /> Quản lý</Space>
            </Tag>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Xem báo cáo & doanh thu</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Quản trị nhân sự & phân quyền</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Cấu hình bảng giá dịch vụ</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Điều phối & khóa khung giờ</div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Tag color="cyan" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <Space size={4}><UserIcon size={12} /> Lễ tân</Space>
            </Tag>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Tiếp nhận máy & tạo phiếu</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Điều phối lịch hẹn</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Báo giá cho khách</div>
            </div>
          </div>

          <div>
            <Tag color="green" style={{ borderRadius: '12px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <Space size={4}><UserIcon size={12} /> Kỹ thuật viên</Space>
            </Tag>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Xem phiếu được phân công</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b5563', fontSize: '14px' }}><CheckOutlined style={{ color: '#10b981', marginTop: '3px' }} /> Cập nhật trạng thái sửa chữa</div>
            </div>
          </div>

        </Card>
      </Col>
    </Row>
  );
};

const UserIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default HR;
