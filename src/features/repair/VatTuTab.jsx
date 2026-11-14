import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Space, Table, message } from 'antd';
import { api } from '../../services/api';
import StatusTag from '../../components/StatusTag';


export default function VatTuTab() {
  const [form] = Form.useForm();
  const [tickets, setTickets] = useState([]);
  const [parts, setParts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [requestError, setRequestError] = useState('');

  const loadCatalogs = useCallback(async () => {
    setLoading(true);
    const [ticketsRes, partsRes] = await Promise.allSettled([api.getPhieuSuaChua(), api.getLinhKien()]);
    if (ticketsRes.status === 'fulfilled') setTickets((ticketsRes.value.data || []).filter((x) =>
      ['DANG_SUA', 'CHO_LINH_KIEN'].includes(x.trangThai)));
    if (partsRes.status === 'fulfilled') setParts(partsRes.value.data || []);
    setCatalogError(ticketsRes.status === 'rejected' || partsRes.status === 'rejected'
      ? 'Không tải đủ phiếu sửa chữa và danh mục linh kiện. Hãy thử lại.' : '');
    setLoading(false);
  }, []);
  useEffect(() => { Promise.resolve().then(loadCatalogs); }, [loadCatalogs]);

  useEffect(() => {
    if (!ticketId) return;
    let active = true;
    api.getYeuCauVatTuV3(ticketId)
      .then((result) => { if (active) { setRequests(result.data || []); setRequestError(''); } })
      .catch(() => { if (active) setRequestError('Không cập nhật được yêu cầu vật tư của phiếu. Hãy chọn lại phiếu để thử lại.'); });
    return () => { active = false; };
  }, [ticketId]);

  const submit = async (values) => {
    if (!ticketId) { message.warning('Chọn phiếu sửa chữa.'); return; }
    if (catalogError || requestError) { message.error('Cần tải lại dữ liệu vật tư trước khi gửi yêu cầu.'); return; }
    setSaving(true);
    try {
      await api.taoYeuCauVatTuV3(ticketId, {
        ghiChu: values.ghiChu?.trim() || null,
        chiTiet: [{ linhKienId: values.linhKienId, soLuong: values.soLuong }],
      });
      message.success('Đã gửi yêu cầu vật tư đến kho.');
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không tạo được yêu cầu vật tư.');
      setSaving(false);
      return;
    }
    try {
      const result = await api.getYeuCauVatTuV3(ticketId);
      setRequests(result.data || []);
      setRequestError('');
    } catch { setRequestError('Đã gửi yêu cầu, nhưng chưa tải được danh sách mới. Hãy chọn lại phiếu để thử lại.'); }
    finally { setSaving(false); }
  };

  const rows = requests.flatMap((req) => (req.chiTiet || []).map((line) => ({
    key: `${req.id}-${line.id}`, requestId: req.id, date: req.ngayYeuCau,
    status: req.trangThai, note: req.ghiChu,
    part: parts.find((p) => p.id === line.linhKienId)?.tenLinhKien || `Linh kiện #${line.linhKienId}`,
    requested: line.soLuongYeuCau, approved: line.soLuongDuyet,
  })));

  return <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <Alert type="info" showIcon
      message="Yêu cầu vật tư"
      description="Chọn phiếu đang sửa và linh kiện cần dùng. Thủ kho duyệt số lượng trước khi xuất." />
    {catalogError && <Alert type="error" showIcon message={catalogError}
      action={<Button size="small" onClick={loadCatalogs}>Thử lại</Button>} />}
    {requestError && <Alert type="error" showIcon message={requestError} />}
    <Card title="Tạo yêu cầu linh kiện" loading={loading}>
      <Select style={{ width: '100%', marginBottom: 16 }} showSearch optionFilterProp="label"
        placeholder="Chọn phiếu sửa chữa đang làm" value={ticketId}
        onChange={(id) => { setRequests([]); setRequestError(''); setTicketId(id); }}
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
        <Button type="primary" htmlType="submit" disabled={!ticketId || !!catalogError || !!requestError}
          loading={saving}>Gửi yêu cầu</Button>
      </Form>
    </Card>
    <Card title="Yêu cầu của phiếu đã chọn">
      <Table dataSource={requestError ? [] : rows} rowKey="key" pagination={{ pageSize: 8 }}
        locale={{ emptyText: requestError ? 'Chưa tải được yêu cầu vật tư' : 'Chưa có yêu cầu vật tư' }} columns={[
        { title: 'Yêu cầu', dataIndex: 'requestId', render: (v) => `#${v}` },
        { title: 'Linh kiện', dataIndex: 'part' },
        { title: 'Số lượng', dataIndex: 'requested' },
        { title: 'Đã duyệt', dataIndex: 'approved', render: (v) => v ?? '—' },
        { title: 'Trạng thái', dataIndex: 'status', render: (v) => <StatusTag value={v} /> },
      ]} />
    </Card>
  </Space>;
}
