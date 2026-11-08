import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const { Text } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;

export default function OutgoingInvoicePanel({ invoice }) {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [adjustForm] = Form.useForm();
  const [document, setDocument] = useState(null);
  const [busy, setBusy] = useState(false);
  const invoiceId = invoice?.id;
  const load = useCallback(async () => {
    if (!invoiceId) return;
    try { setDocument(((await api.getHoaDonDienTuV3({ hoaDonId: invoiceId })).data || [])[0] || null); }
    catch (e) { message.error(errorText(e)); }
  }, [invoiceId]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const record = async (v) => {
    setBusy(true);
    try {
      await api.ghiHoaDonDienTuV3({ ...v, hoaDonId: invoice.id,
        ngayPhatHanh: v.ngayPhatHanh.toISOString(), tongTien: invoice.tongThanhToan });
      message.success('Đã ghi thông tin hóa đơn điện tử phát hành bên ngoài.');
      form.resetFields(); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const adjust = async (v) => {
    setBusy(true);
    try {
      await api.ghiDieuChinhHoaDonV3(document.id, {
        ...v, ngayChungTu: v.ngayChungTu.toISOString(),
      });
      message.success('Đã ghi chứng từ điều chỉnh.');
      adjustForm.resetFields(); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  return <Card size="small" title="Đối chiếu hóa đơn điện tử đầu ra">
    <Alert type="warning" showIcon style={{ marginBottom: 12 }}
      message="Chưa kết nối đơn vị hóa đơn điện tử"
      description="Mục này ghi lại chứng từ đã phát hành trên hệ thống của nhà cung cấp để đối chiếu với hóa đơn nội bộ. Thao tác tại đây không phát hành, hủy hoặc điều chỉnh hóa đơn điện tử thực tế." />
    {document ? <Space direction="vertical" style={{ width: '100%' }}>
      <Text><b>{document.nhaCungCap}</b> · Số {document.soHoaDon} · {money(document.tongTien)}
        {' · '}<Tag>{document.trangThai}</Tag></Text>
      <Text>Phát hành: {dayjs(document.ngayPhatHanh).format('DD/MM/YYYY HH:mm')}
        {' · '}Mã tra cứu: {document.maTraCuu || '—'}</Text>
      <Table size="small" dataSource={document.dieuChinh || []} rowKey="id" pagination={false} columns={[
        { title: 'Loại', dataIndex: 'loai' }, { title: 'Số chứng từ', dataIndex: 'soChungTu' },
        { title: 'Lý do', dataIndex: 'lyDo' },
        { title: 'Chênh lệch', dataIndex: 'chenhLechTien', render: money },
      ]} />
      {user?.role === 'admin' && <Form form={adjustForm} layout="inline" style={{ gap: 8 }} onFinish={adjust}>
        <Form.Item name="loai" rules={[{ required: true }]}>
          <Select style={{ width: 140 }} placeholder="Loại" options={[
            { value: 'DIEU_CHINH', label: 'Điều chỉnh' },
            { value: 'THAY_THE', label: 'Thay thế' }, { value: 'HUY', label: 'Hủy' },
          ]} /></Form.Item>
        <Form.Item name="soChungTu" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={100} placeholder="Số chứng từ" /></Form.Item>
        <Form.Item name="ngayChungTu" rules={[{ required: true }]}>
          <DatePicker showTime format="DD/MM/YYYY HH:mm" /></Form.Item>
        <Form.Item name="chenhLechTien" rules={[{ required: true }]}>
          <InputNumber style={{ width: 150 }} placeholder="Chênh lệch +/-" /></Form.Item>
        <Form.Item name="lyDo" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={1000} placeholder="Lý do" /></Form.Item>
        <Button htmlType="submit" loading={busy}>Ghi điều chỉnh</Button>
      </Form>}
    </Space> : user?.role === 'admin' ?
      <Form form={form} layout="inline" style={{ gap: 8 }} onFinish={record}>
        <Form.Item name="nhaCungCap" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={150} placeholder="Đơn vị phát hành" /></Form.Item>
        <Form.Item name="soHoaDon" rules={[{ required: true, whitespace: true }]}>
          <Input maxLength={100} placeholder="Số hóa đơn" /></Form.Item>
        <Form.Item name="ngayPhatHanh" rules={[{ required: true }]}>
          <DatePicker showTime format="DD/MM/YYYY HH:mm" /></Form.Item>
        <Form.Item name="maTraCuu"><Input maxLength={150} placeholder="Mã tra cứu" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Ghi chứng từ đã phát hành</Button>
      </Form> : <Text type="secondary">Chưa ghi chứng từ điện tử cho hóa đơn này.</Text>}
  </Card>;
}
