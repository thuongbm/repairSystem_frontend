import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, message } from 'antd';
import { api } from '../../services/api';

const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';

export default function BaoHanhNccTab() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);
  const [serials, setSerials] = useState([]);
  const [claims, setClaims] = useState([]);
  const [busy, setBusy] = useState(false);
  const [receiving, setReceiving] = useState(null);
  const [result, setResult] = useState('');
  const partId = Form.useWatch('linhKienId', form);

  const reload = useCallback(async () => {
    try { setRows((await api.getBaoHanhNccV3()).data || []); }
    catch (e) { message.error(errorText(e)); }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.getBaoHanhNccV3(), api.getNhaCungCap(), api.getLinhKien(),
      api.getLinhKienSerials(), api.getBaoHanhKhachV3()])
      .then(([r, s, p, sn, c]) => {
        if (!active) return;
        setRows(r.data || []); setSuppliers(s.data || []); setParts(p.data || []);
        setSerials(sn.data || []); setClaims(c.data || []);
      })
      .catch((e) => message.error(errorText(e)));
    return () => { active = false; };
  }, []);

  const perform = async (action, success) => {
    setBusy(true);
    try { await action(); message.success(success); await reload(); return true; }
    catch (e) { message.error(errorText(e)); return false; }
    finally { setBusy(false); }
  };

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Alert type="info" showIcon message="Hồ sơ bảo hành nhà cung cấp"
      description="Theo dõi gửi và nhận lại từ nhà cung cấp. Hàng hỏng hoặc hàng thay thế cần xử lý kho riêng; thao tác nhận lại ở đây chưa cộng tồn tự động." />
    <Card title="Lập hồ sơ gửi nhà cung cấp" size="small">
      <Form form={form} layout="inline" initialValues={{ soLuong: 1 }} style={{ gap: 8 }}
        onFinish={(v) => perform(async () => {
          await api.taoBaoHanhNccV3({ ...v, phieuBaoHanhId: v.phieuBaoHanhId || null,
            linhKienSerialId: v.linhKienSerialId || null });
          form.resetFields();
        }, 'Đã tạo hồ sơ bảo hành nhà cung cấp.')}>
        <Form.Item name="nhaCungCapId" rules={[{ required: true }]}><Select showSearch optionFilterProp="label"
          placeholder="Nhà cung cấp" style={{ width: 190 }}
          options={suppliers.map((x) => ({ value: x.id, label: x.tenNcc }))} /></Form.Item>
        <Form.Item name="linhKienId" rules={[{ required: true }]}><Select showSearch optionFilterProp="label"
          placeholder="Linh kiện" style={{ width: 230 }} onChange={() => form.setFieldValue('linhKienSerialId', undefined)}
          options={parts.map((x) => ({ value: x.id, label: x.tenLinhKien }))} /></Form.Item>
        <Form.Item name="linhKienSerialId"><Select allowClear showSearch optionFilterProp="label"
          placeholder="Serial (nếu có)" style={{ width: 180 }}
          options={serials.filter((x) => x.linhKienId === partId)
            .map((x) => ({ value: x.id, label: x.soSerial }))} /></Form.Item>
        <Form.Item name="soLuong" rules={[{ required: true }]}><InputNumber min={1} placeholder="Số lượng" /></Form.Item>
        <Form.Item name="phieuBaoHanhId"><Select allowClear showSearch optionFilterProp="label"
          placeholder="Bảo hành khách (nếu có)" style={{ width: 210 }}
          options={claims.map((x) => ({ value: x.id, label: `#${x.id} — ${x.loiKhachBao}` }))} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Tạo hồ sơ</Button>
      </Form>
    </Card>
    <Table dataSource={rows} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 900 }} columns={[
      { title: 'Mã', dataIndex: 'id', render: (v) => `#${v}` },
      { title: 'Nhà cung cấp', dataIndex: 'nhaCungCapId', render: (v) => suppliers.find((x) => x.id === v)?.tenNcc || `#${v}` },
      { title: 'Linh kiện', dataIndex: 'linhKienId', render: (v) => parts.find((x) => x.id === v)?.tenLinhKien || `#${v}` },
      { title: 'Serial', dataIndex: 'linhKienSerialId', render: (v) => serials.find((x) => x.id === v)?.soSerial || '—' },
      { title: 'Số lượng', dataIndex: 'soLuong' },
      { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
      { title: 'Kết quả', dataIndex: 'ketQua' },
      { title: '', render: (_, row) => row.trangThai === 'CHO_GUI'
        ? <Button size="small" onClick={() => perform(() => api.guiBaoHanhNccV3(row.id), 'Đã ghi nhận gửi nhà cung cấp.')}>Đánh dấu đã gửi</Button>
        : row.trangThai === 'DA_GUI'
          ? <Button size="small" onClick={() => { setReceiving(row); setResult(''); }}>Nhận lại</Button> : null },
    ]} />
    <Modal open={!!receiving} title={`Nhận lại hồ sơ #${receiving?.id || ''}`}
      onCancel={() => setReceiving(null)} okText="Xác nhận" confirmLoading={busy}
      okButtonProps={{ disabled: !result.trim() }}
      onOk={async () => {
        if (await perform(() => api.nhanLaiBaoHanhNccV3(receiving.id, { ketQua: result.trim() }), 'Đã ghi kết quả nhà cung cấp.'))
          setReceiving(null);
      }}>
      <Input.TextArea value={result} onChange={(e) => setResult(e.target.value)}
        maxLength={1000} rows={3} placeholder="Kết quả kiểm tra, sửa, đổi hoặc từ chối" />
    </Modal>
  </Space>;
}
