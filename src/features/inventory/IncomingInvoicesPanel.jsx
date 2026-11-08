import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';

const { Text } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;

export default function IncomingInvoicesPanel() {
  const [form] = Form.useForm();
  const receiptId = Form.useWatch('phieuNhapId', form);
  const [receipts, setReceipts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([
        api.getPhieuNhap({ trangThai: 'DA_NHAP_KHO' }), api.getHoaDonDauVaoV3(),
      ]);
      setReceipts(p.data || []); setInvoices(h.data || []);
    } catch (e) { message.error(errorText(e)); }
  }, []);
  useEffect(() => { Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    if (!receiptId) return;
    let active = true;
    api.getPhieuNhapById(receiptId).then((r) => { if (active) setDetail(r.data); })
      .catch((e) => message.error(errorText(e)));
    return () => { active = false; };
  }, [receiptId]);

  const submit = async (values) => {
    setBusy(true);
    try {
      await api.ghiHoaDonDauVaoV3({ ...values,
        ngayHoaDon: values.ngayHoaDon.format('YYYY-MM-DD'),
        ghiChu: values.ghiChu || null });
      message.success('Đã đối chiếu hóa đơn với phiếu nhập.');
      form.resetFields(); setDetail(null); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const pending = receipts.filter((x) => !invoices.some((h) => h.phieuNhapId === x.id));
  const lines = detail?.chiTiet || detail?.chiTietNhapKho || [];
  const stockValue = lines.reduce((sum, x) => sum + Number(x.thanhTien ?? x.soLuongNhap * x.donGiaNhap), 0);

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Alert type="info" showIcon message="Hóa đơn mua vào được đối chiếu với phiếu nhập đã xác nhận"
      description="Tiền hàng và mã số thuế nhà cung cấp được so với dữ liệu kho. Nếu chênh lệch, hệ thống giữ trạng thái cần kiểm tra và yêu cầu ghi lý do." />
    <Card size="small" title="Ghi hóa đơn nhà cung cấp">
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="phieuNhapId" label="Phiếu nhập" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label" options={pending.map((x) => ({
            value: x.id, label: `${x.maPn} · ${x.tenNcc || `NCC #${x.nhaCungCapId}`}`,
          }))} /></Form.Item>
        {detail && <Text>Giá trị nhập kho: <b>{money(stockValue)}</b> · Chứng từ NCC: {detail.phieu?.soChungTuNcc || detail.soChungTuNcc || '—'}</Text>}
        <Space wrap style={{ width: '100%', marginTop: 12 }}>
          <Form.Item name="soHoaDon" label="Số hóa đơn" rules={[{ required: true, whitespace: true }]}>
            <Input maxLength={100} style={{ width: 180 }} /></Form.Item>
          <Form.Item name="ngayHoaDon" label="Ngày hóa đơn" rules={[{ required: true }]}>
            <DatePicker format="DD/MM/YYYY" /></Form.Item>
          <Form.Item name="maSoThueNcc" label="MST nhà cung cấp" rules={[{ required: true, whitespace: true }]}>
            <Input maxLength={30} style={{ width: 170 }} /></Form.Item>
          <Form.Item name="tienHang" label="Tiền hàng" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: 170 }} /></Form.Item>
          <Form.Item name="tienThue" label="Tiền thuế" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: 150 }} /></Form.Item>
        </Space>
        <Form.Item name="ghiChu" label="Lý do chênh lệch (nếu có)">
          <Input.TextArea maxLength={500} rows={2} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Ghi và đối chiếu</Button>
      </Form>
    </Card>
    <Card size="small" title="Hóa đơn đầu vào đã ghi" extra={<Button onClick={load}>Làm mới</Button>}>
      <Table size="small" dataSource={invoices} rowKey="id" pagination={{ pageSize: 8 }} columns={[
        { title: 'Phiếu nhập', dataIndex: 'phieuNhapId', render: (id) => receipts.find((x) => x.id === id)?.maPn || `#${id}` },
        { title: 'Số hóa đơn', dataIndex: 'soHoaDon' },
        { title: 'Ngày', dataIndex: 'ngayHoaDon', render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
        { title: 'Tiền hàng', dataIndex: 'tienHang', render: money },
        { title: 'Thuế', dataIndex: 'tienThue', render: money },
        { title: 'Chênh lệch', dataIndex: 'chenhLech', render: money },
        { title: 'Đối chiếu', dataIndex: 'trangThai', render: (v) => <Tag color={v === 'KHOP' ? 'green' : 'red'}>{v}</Tag> },
        { title: 'Ghi chú', dataIndex: 'ghiChu' },
      ]} />
    </Card>
  </Space>;
}
