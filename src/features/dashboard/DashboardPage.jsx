import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [claims, setClaims] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.getPhieuSuaChua(), api.getBaoHanhKhachV3(),
      ['admin', 'warehouse'].includes(user?.role) ? api.getCanhBaoTonKho() : Promise.resolve(null)])
      .then((results) => {
        if (!active) return;
        if (results[0].status === 'fulfilled') setTickets(results[0].value.data || []);
        if (results[1].status === 'fulfilled') setClaims(results[1].value.data || []);
        if (results[2].status === 'fulfilled' && results[2].value)
          setLowStock(results[2].value.data || []);
        if (results[0].status === 'rejected')
          message.error(results[0].reason.response?.data?.message || 'Không tải được phiếu sửa chữa.');
      });
    return () => { active = false; };
  }, [user?.role]);

  const openCount = tickets.filter((x) => !['DA_TRA', 'HUY'].includes(x.trangThai)).length;
  const readyCount = tickets.filter((x) => x.trangThai === 'HOAN_THANH').length;
  const warrantyCount = claims.filter((x) => !['DA_TRA', 'TU_CHOI'].includes(x.trangThai)).length;
  const targets = [
    { role: ['admin', 'receptionist'], path: '/reception', label: 'Tiếp nhận và thu ngân' },
    { role: ['admin', 'technician'], path: '/technician', label: 'Phiếu kỹ thuật' },
    { role: ['admin', 'warehouse'], path: '/warehouse', label: 'Quản lý kho' },
    { role: ['admin'], path: '/hr', label: 'Tạo nhân viên' },
  ];

  return <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <Title level={3}>Tổng quan từ CSDL V3</Title>
    <Alert type="info" showIcon message="Số liệu hiện hành" description="Các chỉ số dưới đây đọc từ phiếu sửa chữa, bảo hành và cảnh báo kho; CSDL mới sẽ hiển thị 0 cho tới khi có nghiệp vụ." />
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}><Card><Statistic title="Phiếu chưa kết thúc" value={openCount} /></Card></Col>
      <Col xs={24} sm={12} lg={6}><Card><Statistic title="Sẵn sàng bàn giao" value={readyCount} /></Card></Col>
      <Col xs={24} sm={12} lg={6}><Card><Statistic title="Bảo hành đang xử lý" value={warrantyCount} /></Card></Col>
      {['admin', 'warehouse'].includes(user?.role) &&
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Cảnh báo tồn kho" value={lowStock.length} /></Card></Col>}
    </Row>
    <Space wrap>{targets.filter((x) => x.role.includes(user?.role)).map((x) =>
      <Button key={x.path} onClick={() => navigate(x.path)}>{x.label}</Button>)}</Space>
    <Card title="Phiếu gần đây">
      <Table dataSource={tickets.slice(0, 10)} rowKey="id" pagination={false} columns={[
        { title: 'Mã', dataIndex: 'maPhieu' },
        { title: 'Thiết bị', dataIndex: 'tenThietBi' },
        { title: 'Khách hàng', dataIndex: 'tenKhachHang', render: (v) => v || '—' },
        { title: 'Ngày nhận', dataIndex: 'ngayNhan', render: (v) => dayjs(v).format('DD/MM/YYYY') },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
      ]} />
      {user?.role === 'technician' && <Text type="secondary">Kỹ thuật viên chỉ thấy phiếu mình phụ trách.</Text>}
    </Card>
  </Space>;
}
