import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Space, Table, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const { Title, Text } = Typography;

export default function CustomerPortalPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api.getDichVu().then((res) => { if (active) setServices(res.data || []); })
      .catch(() => message.error('Không tải được danh mục dịch vụ.'));
    return () => { active = false; };
  }, []);

  const lookup = async () => {
    if (!serial.trim()) { message.warning('Nhập serial linh kiện.'); return; }
    setBusy(true); setResult(null);
    try { setResult((await api.traCuuBaoHanhSerial(serial.trim())).data); }
    catch (e) { message.error(e.response?.data?.message || 'Không tìm thấy serial.'); }
    finally { setBusy(false); }
  };

  return <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px' }}>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={2} style={{ margin: 0 }}>Dịch vụ sửa chữa thiết bị</Title>
        <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
      </Space>
      <Alert type="info" showIcon message="Tiếp nhận tại cửa hàng"
        description="Giá niêm yết chỉ để tham khảo. Nhân viên lập phiếu và báo giá sau khi kiểm tra thiết bị; khách xác nhận trước khi sửa." />
      <Card title="Giá dịch vụ hiện có">
        <Table dataSource={services} rowKey="id" pagination={{ pageSize: 10 }} columns={[
          { title: 'Dịch vụ', dataIndex: 'tenDichVu' },
          { title: 'Mô tả', dataIndex: 'moTa' },
          { title: 'Giá niêm yết', dataIndex: 'giaNiemYet', render: (v) => `${Number(v).toLocaleString('vi-VN')} ₫` },
        ]} />
      </Card>
      <Card title="Tra cứu bảo hành linh kiện theo serial">
        <Space.Compact style={{ width: '100%', maxWidth: 520 }}>
          <Input value={serial} onChange={(e) => setSerial(e.target.value)}
            onPressEnter={lookup} placeholder="Nhập serial trên linh kiện" />
          <Button type="primary" onClick={lookup} loading={busy}>Tra cứu</Button>
        </Space.Compact>
        {result && <div style={{ marginTop: 16 }}>
          <Text strong>{result.tenLinhKien} — {result.soSerial}</Text><br />
          <Text>{result.thongBao}</Text>
        </div>}
      </Card>
    </Space>
  </div>;
}
