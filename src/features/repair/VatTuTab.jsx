import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Space, Table, Tag, message } from 'antd';
import { api } from '../../services/api';

const statusColor = { CHO_DUYET: 'orange', DA_DUYET: 'green', TU_CHOI: 'red', HUY: 'default' };

export default function VatTuTab() {
  const [form] = Form.useForm();
  const [tickets, setTickets] = useState([]);
  const [parts, setParts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.getPhieuSuaChua(), api.getLinhKien()])
      .then(([ticketsRes, partsRes]) => {
        if (!active) return;
        setTickets((ticketsRes.data || []).filter((x) =>
          ['DANG_SUA', 'CHO_LINH_KIEN'].includes(x.trangThai)));
        setParts(partsRes.data || []);
      })
      .catch((error) => message.error(error.response?.data?.message || 'Không tải được phiếu hoặc danh mục linh kiện.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ticketId) return;
    let active = true;
    api.getYeuCauVatTuV3(ticketId)
      .then((result) => { if (active) setRequests(result.data || []); })
      .catch((error) => message.error(error.response?.data?.message || 'Không tải được yêu cầu vật tư.'));
    return () => { active = false; };
  }, [ticketId]);

  const submit = async (values) => {
    if (!ticketId) { message.warning('Chọn phiếu sửa chữa.'); return; }
    setSaving(true);
    try {
      await api.taoYeuCauVatTuV3(ticketId, {
        ghiChu: values.ghiChu?.trim() || null,
        chiTiet: [{ linhKienId: values.linhKienId, soLuong: values.soLuong }],
      });
      message.success('Đã gửi yêu cầu vật tư đến kho.');
      form.resetFields();
      const result = await api.getYeuCauVatTuV3(ticketId);
      setRequests(result.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không tạo được yêu cầu vật tư.');
    } finally { setSaving(false); }
  };

  const rows = requests.flatMap((req) => (req.chiTiet || []).map((line) => ({
    key: `${req.id}-${line.id}`, requestId: req.id, date: req.ngayYeuCau,
    status: req.trangThai, note: req.ghiChu,
    part: parts.find((p) => p.id === line.linhKienId)?.tenLinhKien || `Linh kiện #${line.linhKienId}`,
    requested: line.soLuongYeuCau, approved: line.soLuongDuyet,
  })));

  return <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <Alert type="info" showIcon
      message="Yêu cầu vật tư thật"
      description="Chọn phiếu đang sửa và mẫu linh kiện đã có. Thủ kho duyệt số lượng trước khi xuất." />
    <Card title="Tạo yêu cầu linh kiện" loading={loading}>
      <Select style={{ width: '100%', marginBottom: 16 }} showSearch optionFilterProp="label"
        placeholder="Chọn phiếu sửa chữa đang làm" value={ticketId}
        onChange={(id) => { setRequests([]); setTicketId(id); }}
        options={tickets.map((t) => ({ value: t.id,
          label: `${t.maPhieu} — ${t.tenThietBi} — ${t.tenKhachHang}` }))} />
      <Form form={form} layout="vertical" onFinish={submit} initialValues={{ soLuong: 1 }}>
        <Form.Item name="linhKienId" label="Mẫu linh kiện" rules={[{ required: true, message: 'Chọn linh kiện.' }]}>
          <Select showSearch optionFilterProp="label" placeholder="Tìm mã hoặc tên"
            options={parts.map((p) => ({ value: p.id, label: `${p.maLk} — ${p.tenLinhKien}` }))} />
        </Form.Item>
        <Form.Item name="soLuong" label="Số lượng cần" rules={[{ required: true }]}>
          <InputNumber min={1} max={100000} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="ghiChu" label="Lý do / ghi chú"><Input.TextArea rows={2} maxLength={500} /></Form.Item>
        <Button type="primary" htmlType="submit" disabled={!ticketId} loading={saving}>Gửi yêu cầu</Button>
      </Form>
    </Card>
    <Card title="Yêu cầu của phiếu đã chọn">
      <Table dataSource={rows} rowKey="key" pagination={{ pageSize: 8 }} columns={[
        { title: 'Yêu cầu', dataIndex: 'requestId', render: (v) => `#${v}` },
        { title: 'Linh kiện', dataIndex: 'part' },
        { title: 'Số lượng', dataIndex: 'requested' },
        { title: 'Đã duyệt', dataIndex: 'approved', render: (v) => v ?? '—' },
        { title: 'Trạng thái', dataIndex: 'status', render: (v) => <Tag color={statusColor[v]}>{v}</Tag> },
      ]} />
    </Card>
  </Space>;
}
