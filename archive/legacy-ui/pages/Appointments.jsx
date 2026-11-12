import { useState } from 'react';
import { Card, Row, Col, Typography, Button, Progress, Tag, Select } from 'antd';
import { LockOutlined, UnlockOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const initialTimeSlots = [
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
  const [slots, setSlots] = useState(initialTimeSlots);

  const toggleLock = (id) => {
    setSlots(prev => prev.map(slot =>
      slot.id === id ? { ...slot, isLocked: !slot.isLocked } : slot
    ));
  };

  const getProgressColor = (booked, capacity) => {
    if (booked > capacity) return '#f59e0b';
    if (booked === capacity) return '#2563eb';
    return '#10b981';
  };

  const getTagStyle = (status) => {
    switch(status) {
      case 'Còn trống': return { color: '#059669', bg: '#ecfdf5', border: '1px solid #a7f3d0' };
      case 'Đã đầy': return { color: '#2563eb', bg: '#eff6ff', border: '1px solid #bfdbfe' };
      case 'Quá tải': return { color: '#d97706', bg: '#fffbeb', border: '1px solid #fde68a' };
      default: return { color: '#475569', bg: '#f8fafc', border: '1px solid #e2e8f0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Row gutter={20}>
        <Col span={16}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0, fontWeight: 600 }}>Khung giờ làm việc — Thứ 5, 25/09</Title>
            <Tag style={{ borderRadius: '4px' }}>Tổng 6 khung giờ</Tag>
          </div>

          <Row gutter={[16, 16]}>
            {slots.map(slot => {
              const tagStyle = getTagStyle(slot.status);
              return (
                <Col span={12} key={slot.id}>
                  <Card bordered style={{ borderRadius: '8px', borderColor: slot.isLocked ? '#93c5fd' : '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <Text style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{slot.time}</Text>
                      <span style={{
                        color: tagStyle.color,
                        background: tagStyle.bg,
                        border: tagStyle.border,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {slot.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                      <Text type="secondary">Tải lịch hẹn</Text>
                      <Text style={{ fontWeight: 600, color: '#0f172a' }}>{slot.booked}/{slot.capacity}</Text>
                    </div>
                    <Progress
                      percent={Math.min((slot.booked / slot.capacity) * 100, 100)}
                      showInfo={false}
                      strokeColor={getProgressColor(slot.booked, slot.capacity)}
                      trailColor="#f1f5f9"
                      style={{ marginBottom: '14px' }}
                    />

                    <Button
                      block
                      size="small"
                      type={slot.isLocked ? 'primary' : 'default'}
                      icon={slot.isLocked ? <LockOutlined /> : <UnlockOutlined />}
                      onClick={() => toggleLock(slot.id)}
                      style={{
                        borderRadius: '6px',
                      }}
                    >
                      {slot.isLocked ? 'Đã khóa nhận khách' : 'Khóa khung giờ'}
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Col>

        <Col span={8}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={5} style={{ margin: 0, fontWeight: 600 }}>Lịch hẹn đang chờ</Title>
            <Tag color="blue" style={{ borderRadius: '10px' }}>{pendingAppointments.length}</Tag>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingAppointments.map(app => (
              <Card key={app.id} bordered style={{ borderRadius: '8px', borderColor: '#e2e8f0' }} styles={{ body: { padding: '14px' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{app.customer}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserOutlined /> {app.phone}
                    </div>
                  </div>
                  <Tag style={{ borderRadius: '4px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '11px' }}>{app.id}</Tag>
                </div>

                <div>
                  <div style={{ color: '#334155', fontSize: '13px', fontWeight: 500 }}>{app.device}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <SettingOutlined /> {app.tasks}
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <Select
                    placeholder="Phân công KTV"
                    size="small"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'KTV Tuấn Anh', label: 'KTV Tuấn Anh' },
                      { value: 'KTV Văn Hùng', label: 'KTV Văn Hùng' },
                      { value: 'KTV Quốc Bảo', label: 'KTV Quốc Bảo' },
                    ]}
                  />
                </div>
              </Card>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Appointments;