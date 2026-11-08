import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const { Text } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;

export default function WorkItemsPanel({ ticketId, technicians = [], issued = [], claims = [] }) {
  const { user } = useAuth();
  const [createForm] = Form.useForm();
  const [finishForm] = Form.useForm();
  const [payForm] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [proposing, setProposing] = useState(null);
  const [approving, setApproving] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    try { setRows((await api.getCongViecSuaChuaV3({ phieuId: ticketId })).data || []); }
    catch (e) { message.error(errorText(e)); }
  }, [ticketId]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const perform = async (action, success) => {
    setBusy(true);
    try {
      await action();
      message.success(success);
      setFinishing(null); setPaying(null); setProposing(null); setApproving(null); setCancelling(null);
      finishForm.resetFields(); payForm.resetFields();
      await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const canAssign = user?.role === 'admin' || user?.role === 'receptionist';
  const canWork = user?.role === 'technician';
  const availableParts = issued.filter((x) => !rows.some((r) =>
    (r.vatTu || []).includes(x.chiTietXuatKhoId)));

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Alert type="info" showIcon message="Theo dõi từng công việc và tiền công"
      description="Lễ tân hoặc quản lý giao việc; thợ ghi thời gian bắt đầu, kết quả và linh kiện đã dùng. Thợ đề xuất công sau khi hoàn thành; quản lý duyệt và ghi chứng từ chi trả." />
    {canAssign && <Card size="small" title="Giao công việc mới">
      <Form form={createForm} layout="inline" style={{ gap: 8 }} onFinish={(v) => perform(async () => {
        await api.taoCongViecSuaChuaV3({ phieuId: ticketId,
          phieuBaoHanhId: v.phieuBaoHanhId || null,
          kyThuatVienId: v.kyThuatVienId, moTa: v.moTa.trim() });
        createForm.resetFields();
      }, 'Đã giao công việc.')}>
        <Form.Item name="moTa" rules={[{ required: true, whitespace: true }]}>
          <Input style={{ width: 300 }} maxLength={500} placeholder="Hạng mục cần sửa" />
        </Form.Item>
        <Form.Item name="kyThuatVienId" rules={[{ required: true }]}>
          <Select style={{ width: 230 }} placeholder="Thợ phụ trách"
            options={technicians.map((x) => ({ value: x.id, label: x.hoTen }))} />
        </Form.Item>
        <Form.Item name="phieuBaoHanhId">
          <Select allowClear style={{ width: 175 }} placeholder="Hồ sơ bảo hành"
            options={claims.map((x) => ({ value: x.id, label: `Bảo hành #${x.id}` }))} />
        </Form.Item>
        <Button htmlType="submit" type="primary" loading={busy}>Giao việc</Button>
      </Form>
    </Card>}
    <Table size="small" dataSource={rows} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 950 }}
      columns={[
        { title: 'Việc sửa', render: (_, x) => <><b>#{x.id} · {x.moTa}</b><br />
          <Text type="secondary">{technicians.find((t) => t.id === x.kyThuatVienId)?.hoTen || `Thợ #${x.kyThuatVienId}`}</Text>
          {x.phieuBaoHanhId && <Tag style={{ marginLeft: 8 }}>BH #{x.phieuBaoHanhId}</Tag>}</> },
        { title: 'Thời gian', render: (_, x) => <>
          {x.batDauLuc ? dayjs(x.batDauLuc).format('DD/MM HH:mm') : 'Chưa bắt đầu'}
          {' → '}{x.hoanThanhLuc ? dayjs(x.hoanThanhLuc).format('DD/MM HH:mm') : '—'}</> },
        { title: 'Kết quả / vật tư', render: (_, x) => <>{x.ketQua || '—'}
          {(x.vatTu || []).length > 0 && <Text type="secondary"> · Xuất kho: {(x.vatTu || []).join(', ')}</Text>}</> },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
        ...(user?.role === 'admin' || canWork ? [{ title: 'Tiền công', render: (_, x) => <>
          {x.congDeXuat == null ? 'Chưa đề xuất' : `Đề xuất ${money(x.congDeXuat)}`}
          {x.congDuyet != null && <><br />Duyệt {money(x.congDuyet)}</>}
          {x.chiTraLuc && <><br /><Tag color="green">Đã chi {dayjs(x.chiTraLuc).format('DD/MM/YYYY')}</Tag></>}
        </> }] : []),
        { title: '', render: (_, x) => <Space wrap>
          {canWork && x.trangThai === 'CHO_LAM' &&
            <Button size="small" loading={busy} onClick={() => perform(
              () => api.batDauCongViecV3(x.id), 'Đã bắt đầu việc.')}>Bắt đầu</Button>}
          {canWork && x.trangThai === 'DANG_LAM' &&
            <Button size="small" onClick={() => setFinishing(x)}>Hoàn thành</Button>}
          {canWork && x.trangThai === 'HOAN_THANH' && x.congDeXuat == null &&
            <Button size="small" onClick={() => setProposing(x)}>Đề xuất công</Button>}
          {user?.role === 'admin' && x.congDeXuat != null && x.congDuyet == null &&
            <Button size="small" onClick={() => setApproving(x)}>Duyệt công</Button>}
          {user?.role === 'admin' && x.congDuyet != null && !x.chiTraLuc &&
            <Button size="small" onClick={() => setPaying(x)}>Ghi chi trả</Button>}
          {canAssign && ['CHO_LAM', 'DANG_LAM'].includes(x.trangThai) &&
            <Button size="small" danger onClick={() => setCancelling(x)}>Hủy việc</Button>}
        </Space> },
      ]} />
    {finishing && <Card size="small" title={`Hoàn thành công việc #${finishing.id}`}>
      <Form form={finishForm} layout="vertical" onFinish={(v) => perform(() =>
        api.hoanThanhCongViecV3(finishing.id, { ketQua: v.ketQua.trim(),
          chiTietXuatKhoIds: v.chiTietXuatKhoIds || [] }), 'Đã lưu kết quả sửa.')}>
        <Form.Item name="ketQua" label="Kết quả" rules={[{ required: true, whitespace: true }]}>
          <Input.TextArea rows={3} maxLength={1000} /></Form.Item>
        <Form.Item name="chiTietXuatKhoIds" label="Linh kiện đã dùng trong việc này">
          <Select mode="multiple" options={availableParts.map((x) => ({
            value: x.chiTietXuatKhoId,
            label: `${x.tenLinhKien || 'Linh kiện'} · ${x.soSerial || `dòng #${x.chiTietXuatKhoId}`}`,
          }))} /></Form.Item>
        <Space><Button htmlType="submit" type="primary" loading={busy}>Lưu hoàn thành</Button>
          <Button onClick={() => setFinishing(null)}>Hủy</Button></Space>
      </Form>
    </Card>}
    {proposing && <Card size="small" title={`Đề xuất công việc #${proposing.id}`}>
      <Form layout="inline" style={{ gap: 8 }} onFinish={(v) => perform(() =>
        api.deXuatCongV3(proposing.id, { soTien: v.soTien }), 'Đã đề xuất tiền công.')}>
        <Form.Item name="soTien" rules={[{ required: true }]}>
          <InputNumber min={0} max={999999999999} style={{ width: 200 }} placeholder="Số tiền đề xuất" />
        </Form.Item><Button type="primary" htmlType="submit" loading={busy}>Gửi đề xuất</Button>
        <Button onClick={() => setProposing(null)}>Hủy</Button>
      </Form>
    </Card>}
    {approving && <Card size="small" title={`Duyệt công việc #${approving.id}`}>
      <Form layout="inline" style={{ gap: 8 }} initialValues={{ soTien: approving.congDeXuat }}
        onFinish={(v) => perform(() => api.duyetCongV3(approving.id, v), 'Đã duyệt công.')}>
        <Form.Item name="soTien" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: 180 }} /></Form.Item>
        <Form.Item name="lyDo" rules={[{ required: true, whitespace: true }]}>
          <Input style={{ width: 280 }} maxLength={500} placeholder="Lý do quyết định" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Duyệt</Button>
        <Button onClick={() => setApproving(null)}>Hủy</Button>
      </Form>
    </Card>}
    {paying && <Card size="small" title={`Ghi chi trả ${money(paying.congDuyet)} cho việc #${paying.id}`}>
      <Form form={payForm} layout="inline" style={{ gap: 8 }} initialValues={{ phuongThuc: 'CHUYEN_KHOAN' }}
        onFinish={(v) => perform(() => api.chiTraCongV3(paying.id, v), 'Đã ghi chứng từ chi trả.')}>
        <Form.Item name="phuongThuc"><Select style={{ width: 155 }} options={[
          { value: 'CHUYEN_KHOAN', label: 'Chuyển khoản' }, { value: 'TIEN_MAT', label: 'Tiền mặt' },
        ]} /></Form.Item>
        <Form.Item name="maThamChieu" rules={[{ required: true, whitespace: true }]}>
          <Input style={{ width: 220 }} maxLength={100} placeholder="Mã chứng từ chi" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Ghi chi trả</Button>
        <Button onClick={() => setPaying(null)}>Hủy</Button>
      </Form>
    </Card>}
    {cancelling && <Card size="small" title={`Hủy công việc #${cancelling.id}`}>
      <Form layout="inline" style={{ gap: 8 }} onFinish={(v) => perform(() =>
        api.huyCongViecV3(cancelling.id, v), 'Đã hủy công việc.')}>
        <Form.Item name="lyDo" rules={[{ required: true, whitespace: true }]}>
          <Input style={{ width: 350 }} maxLength={500} placeholder="Lý do hủy" /></Form.Item>
        <Button danger htmlType="submit" loading={busy}>Xác nhận hủy</Button>
        <Button onClick={() => setCancelling(null)}>Bỏ qua</Button>
      </Form>
    </Card>}
  </Space>;
}
