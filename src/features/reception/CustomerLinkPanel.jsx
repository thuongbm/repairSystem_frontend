import { useState } from 'react';
import { Alert, Button, Card, Input, Space, Typography, message } from 'antd';
import { api } from '../../services/api';

const { Text } = Typography;
const errorText = (error) => error.response?.data?.message || error.message || 'Không thể cấp mã.';

export default function CustomerLinkPanel() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [code, setCode] = useState(null);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (!phone.trim()) return;
    setCustomer(null); setCode(null); setBusy(true);
    try { setCustomer((await api.timKhachTheoDienThoai(phone.trim())).data); }
    catch (error) { message.error(error.response?.status === 404 ? 'Không tìm thấy hồ sơ khách.' : errorText(error)); }
    finally { setBusy(false); }
  };

  const issue = async () => {
    if (!customer?.id) return;
    setBusy(true);
    try { setCode((await api.capMaLienKetKhach(customer.id)).data); }
    catch (error) { message.error(errorText(error)); }
    finally { setBusy(false); }
  };

  return <Card title="Liên kết tài khoản khách với hồ sơ cũ">
    <Space direction="vertical" style={{ width: '100%' }}>
      <Text>Chỉ cấp mã sau khi đã xác minh khách tại quầy. Mã dùng một lần và hết hạn sau 15 phút.</Text>
      <Input.Search style={{ maxWidth: 400 }} value={phone} onChange={(event) => {
        setPhone(event.target.value); setCustomer(null); setCode(null);
      }}
        onSearch={search} enterButton="Tìm khách" loading={busy} placeholder="Số điện thoại trong hồ sơ" />
      {customer && <Space><Text>{customer.hoTen} — {customer.soDienThoai}</Text>
        {customer.daCoTaiKhoan ? <Text type="secondary">Đã có tài khoản</Text>
          : <Button onClick={issue} loading={busy}>Cấp mã liên kết</Button>}</Space>}
      {code?.maLienKet && <Alert type="success" showIcon
        message={`Mã liên kết: ${code.maLienKet}`}
        description="Đưa mã trực tiếp cho khách để nhập khi đăng ký. Mã sẽ không hiển thị lại sau khi đóng trang." />}
    </Space>
  </Card>;
}
