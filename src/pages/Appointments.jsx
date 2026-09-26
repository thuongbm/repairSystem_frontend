import React from 'react';
import { Card, Row, Col, Typography, Button, Progress, Tag, Alert, Select } from 'antd';
import { LockOutlined, UnlockOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const timeSlots = [
  { id: 1, time: '08:00 - 09:00', status: 'Còn trống', booked: 2, capacity: 4, isLocked: false },
  { id: 2, time: '09:00 - 10:00', status: 'Đã đầy', booked: 4, capacity: 4, isLocked: false },
  { id: 3, time: '10:00 - 11:00', status: 'Quá tải', booked: 5, capacity: 4, isLocked: true },
  { id: 4, time: '11:00 - 12:00', status: 'Còn trống', booked: 1, capacity: 4, isLocked: false },
  { id: 5, time: '13:30 - 14:30', status: 'Còn trống', booked: 3, capacity: 4, isLocked: false },
  { id: 6, time: '14:30 - 15:30', status: 'Quá tải', booked: 6, capacity: 4, isLocked: true },
];

const pendingAppointments = [
  { 
    id: 'LH-2881', 
    customer: 'Vũ Hải Đăng', 
    phone: '0912 345 678', 
    device: 'Laptop Dell XPS 15', 
    tasks: 'Vệ sinh + Tra keo - 10:00 - 11:00' 
  },
  { 
    id: 'LH-2882', 
    customer: 'Ngô Thanh Vân', 
    phone: '0987 654 321', 
    device: 'PC Gaming - RTX 3070', 
    tasks: 'Sửa VGA - 14:30 - 15:30' 
  },
  { 
    id: 'LH-2883', 
    customer: 'Bùi Anh Khoa', 
    phone: '0906 111 222', 
    device: 'MacBook Pro M1', 
    tasks: 'Thay RAM / SSD - 09:00 - 10:00' 
  },
];

const Appointments = () => {
  const getProgressColor = (booked, capacity) => {
    if (booked > capacity) return '#f59e0b'; // orange for overload
    if (booked === capacity) return '#3b82f6'; // blue for full
    return '#10b981'; // green for available
  };

  const getTagColor = (status) => {
    switch(status) {
      case 'Còn trống': return { color: '#10b981', bg: '#d1fae5' };
      case 'Đã đầy': return { color: '#3b82f6', bg: '#dbeafe' };
      case 'Quá tải': return { color: '#f59e0b', bg: '#fef3c7' };
      default: return { color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Alert
        message="Có 2 khung giờ đang quá tải"
        description="Khóa bớt khung giờ quá tải để dàn đều lượng khách, tránh khách đến cùng lúc."
        type="warning"
        showIcon
        style={{ borderRadius: '8px', border: '1px solid #fde68a', background: '#fffbeb' }}
      />

      <Row gutter={24}>
        <Col span={16}>
          <div style={{ marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>Khung giờ trong ngày — Thứ 5, 25/09</Title>
            <Text type="secondary">Theo dõi tải từng khung giờ và khóa khi hệ thống báo quá tải.</Text>
          </div>
          
          <Row gutter={[16, 16]}>
            {timeSlots.map(slot => {
              const tagStyle = getTagColor(slot.status);
              return (
                <Col span={12} key={slot.id}>
                  <Card bordered style={{ borderRadius: '10px', borderColor: slot.isLocked ? '#93c5fd' : '#f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <Text style={{ fontWeight: '600', fontSize: '15px' }}>{slot.time}</Text>
                      <span style={{ 
                        color: tagStyle.color, 
                        background: tagStyle.bg, 
                        padding: '2px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {slot.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Lịch hẹn</Text>
                      <Text style={{ fontSize: '13px', fontWeight: '500' }}>{slot.booked}/{slot.capacity}</Text>
                    </div>
                    <Progress 
                      percent={Math.min((slot.booked / slot.capacity) * 100, 100)} 
                      showInfo={false} 
                      strokeColor={getProgressColor(slot.booked, slot.capacity)}
                      trailColor="#f3f4f6"
                      style={{ marginBottom: '16px' }}
                    />
                    
                    <Button 
                      block 
                      type={slot.isLocked ? 'primary' : 'default'}
                      icon={slot.isLocked ? <LockOutlined /> : <UnlockOutlined />}
                      style={{ 
                        borderRadius: '6px', 
                        background: slot.isLocked ? '#2563eb' : '#f9fafb',
                        color: slot.isLocked ? '#fff' : '#4b5563',
                        borderColor: slot.isLocked ? '#2563eb' : '#d1d5db'
                      }}
                    >
                      Đóng / Khóa khung giờ
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Col>

        <Col span={8}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={5} style={{ margin: 0 }}>Lịch hẹn đang chờ</Title>
            <span style={{ background: '#e5e7eb', padding: '0 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>3</span>
          </div>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Phân công kỹ thuật viên phụ trách.
          </Text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingAppointments.map(app => (
              <Card key={app.id} bordered style={{ borderRadius: '10px' }} bodyStyle={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{app.customer}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserOutlined /> {app.phone}
                    </div>
                  </div>
                  <Tag style={{ borderRadius: '4px', border: 'none', background: '#f3f4f6', color: '#4b5563' }}>{app.id}</Tag>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#374151', fontSize: '14px', marginBottom: '4px' }}>{app.device}</div>
                  <div style={{ color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <SettingOutlined /> {app.tasks}
                  </div>
                </div>

                <Select
                  placeholder="Phân công kỹ thuật viên"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'hung', label: 'Nguyễn Văn Hùng' },
                    { value: 'tuan', label: 'Lê Minh Tuấn' },
                    { value: 'bao', label: 'Trần Quốc Bảo' },
                  ]}
                  suffixIcon={<UserOutlined />}
                />
              </Card>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Appointments;
