import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, message } from 'antd';
import { api } from '../../services/api';
import StatusTag from '../../components/StatusTag';
import { dispositionLabel } from '../../utils/status';

const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';

export default function BaoHanhNccTab() {
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);
  const [serials, setSerials] = useState([]);
  const [claims, setClaims] = useState([]);
  const [khos, setKhos] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(null);
  const [sendSource, setSendSource] = useState('KHO');
  const [sendKhoId, setSendKhoId] = useState(null);
  const [receiving, setReceiving] = useState(null);
  const [result, setResult] = useState('');
  const [disposing, setDisposing] = useState(null);
  const [dispositionType, setDispositionType] = useState('NHAP_LAI');
  const [dispositionKhoId, setDispositionKhoId] = useState(null);
  const [dispositionReceiptId, setDispositionReceiptId] = useState(null);
  const [dispositionNote, setDispositionNote] = useState('');
  const partId = Form.useWatch('linhKienId', form);

  const reload = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.getBaoHanhNccV3(), api.getNhaCungCap(), api.getLinhKien(),
      api.getLinhKienSerials(), api.getBaoHanhKhachV3(), api.getKho(), api.getPhieuNhap(),
    ]);
    const setters = [setRows, setSuppliers, setParts, setSerials, setClaims, setKhos, setReceipts];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') setters[index](result.value.data || []);
    });
    setLoadError(results.some((result) => result.status === 'rejected')
      ? 'Một phần hồ sơ hoặc danh mục bảo hành nhà cung cấp chưa tải được. Dữ liệu đang hiển thị có thể đã cũ.' : '');
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(reload);
  }, [reload]);

  const perform = async (action, success) => {
    setBusy(true);
    try { await action(); message.success(success); await reload(); return true; }
    catch (e) { message.error(errorText(e)); return false; }
    finally { setBusy(false); }
  };

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Alert type="info" showIcon message="Hồ sơ bảo hành nhà cung cấp"
      description="Chọn nguồn hàng khi gửi. Sau khi nhận lại, ghi cách xử lý kho; hàng thay thế cần có phiếu nhập đã xác nhận." />
    {loadError && <Alert type="error" showIcon message={loadError}
      action={<Button size="small" onClick={reload}>Thử lại</Button>} />}
    <Button onClick={reload} loading={loading}>Làm mới hồ sơ</Button>
    <Card title="Lập hồ sơ gửi nhà cung cấp" size="small">
      <Form form={form} layout="inline" initialValues={{ soLuong: 1 }} style={{ gap: 8 }}
        onFinish={(v) => perform(async () => {
          const sample = (await api.getMauLinhKienV3(v.linhKienId)).data;
          if (sample?.theoDoiSerial && !v.linhKienSerialId)
            throw new Error('Mẫu linh kiện này theo dõi serial; cần chọn serial.');
          if (v.linhKienSerialId && v.soLuong !== 1)
            throw new Error('Hồ sơ có serial chỉ được gửi số lượng 1.');
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
        <Button type="primary" htmlType="submit" loading={busy} disabled={!!loadError}>Tạo hồ sơ</Button>
      </Form>
    </Card>
    <Table dataSource={loadError ? [] : rows} loading={loading} rowKey="id"
      locale={{ emptyText: loadError ? 'Chưa tải đủ hồ sơ bảo hành' : 'Chưa có hồ sơ bảo hành' }}
      pagination={{ pageSize: 8 }} scroll={{ x: 900 }} columns={[
      { title: 'Mã', dataIndex: 'id', render: (v) => `#${v}` },
      { title: 'Nhà cung cấp', dataIndex: 'nhaCungCapId', render: (v) => suppliers.find((x) => x.id === v)?.tenNcc || `#${v}` },
      { title: 'Linh kiện', dataIndex: 'linhKienId', render: (v) => parts.find((x) => x.id === v)?.tenLinhKien || `#${v}` },
      { title: 'Serial', dataIndex: 'linhKienSerialId', render: (v) => serials.find((x) => x.id === v)?.soSerial || '—' },
      { title: 'Số lượng', dataIndex: 'soLuong' },
      { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <StatusTag value={v} /> },
      { title: 'Kết quả', dataIndex: 'ketQua' },
      { title: 'Xử lý kho', dataIndex: 'xuLyKho', render: (v) => dispositionLabel(v?.loai) },
      { title: '', render: (_, row) => row.trangThai === 'CHO_GUI'
        ? <Button size="small" onClick={() => {
          const serial = serials.find((x) => x.id === row.linhKienSerialId);
          setSendSource(serial?.trangThai === 'DA_XUAT' || (!serial && row.phieuBaoHanhId) ? 'KHACH' : 'KHO');
          setSendKhoId(null); setSending(row);
        }}>Đánh dấu đã gửi</Button>
        : row.trangThai === 'DA_GUI'
          ? <Button size="small" onClick={() => { setReceiving(row); setResult(''); }}>Nhận lại</Button>
          : row.trangThai === 'DA_NHAN_LAI' && !row.xuLyKho
            ? <Button size="small" onClick={() => {
              setDisposing(row); setDispositionType('NHAP_LAI'); setDispositionKhoId(null);
              setDispositionReceiptId(null); setDispositionNote('');
            }}>Xử lý kho</Button> : null },
    ]} />
    <Modal open={!!sending} title={`Gửi bảo hành NCC #${sending?.id || ''}`}
      onCancel={() => setSending(null)} okText="Xác nhận gửi" confirmLoading={busy}
      onOk={async () => {
        if (sendSource === 'KHO' && !sending?.linhKienSerialId && !sendKhoId) {
          message.warning('Chọn kho chứa linh kiện.'); return;
        }
        if (await perform(() => api.guiBaoHanhNccV3(sending.id,
          { nguon: sendSource, khoId: sendKhoId }), 'Đã ghi nhận gửi và cập nhật kho.')) setSending(null);
      }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={sendSource} onChange={setSendSource} options={[
          { value: 'KHO', label: 'Gửi từ tồn kho' },
          { value: 'KHACH', label: 'Hàng khách đem bảo hành' },
        ]} />
        {sendSource === 'KHO' && !sending?.linhKienSerialId &&
          <Select placeholder="Chọn kho gửi" value={sendKhoId} onChange={setSendKhoId}
            options={khos.map((x) => ({ value: x.id, label: x.tenKho }))} />}
      </Space>
    </Modal>
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
    <Modal open={!!disposing} title={`Xử lý kho hồ sơ #${disposing?.id || ''}`}
      onCancel={() => setDisposing(null)} okText="Ghi kết quả kho" confirmLoading={busy}
      onOk={async () => {
        if (dispositionType === 'NHAP_LAI' && !dispositionKhoId) {
          message.warning('Chọn kho nhập lại.'); return;
        }
        if (dispositionType === 'NHAP_THAY_THE' && !dispositionReceiptId) {
          message.warning('Nhập ID phiếu nhập thay thế đã xác nhận.'); return;
        }
        if (dispositionType === 'KHONG_NHAP' && !dispositionNote.trim()) {
          message.warning('Nhập lý do không nhập lại.'); return;
        }
        if (await perform(() => api.xuLyKhoBaoHanhNccV3(disposing.id, {
          loai: dispositionType,
          khoId: dispositionType === 'NHAP_LAI' ? dispositionKhoId : null,
          phieuNhapId: dispositionType === 'NHAP_THAY_THE' ? dispositionReceiptId : null,
          ghiChu: dispositionNote.trim() || null,
        }), 'Đã ghi kết quả xử lý kho.')) setDisposing(null);
      }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={dispositionType} onChange={setDispositionType} options={[
          { value: 'NHAP_LAI', label: 'Nhập lại linh kiện cũ còn tốt' },
          { value: 'NHAP_THAY_THE', label: 'Hàng thay thế đã nhập bằng phiếu nhập' },
          { value: 'KHONG_NHAP', label: 'Không nhập lại / thanh lý' },
        ]} />
        {dispositionType === 'NHAP_LAI' && <Select placeholder="Chọn kho nhập lại"
          value={dispositionKhoId} onChange={setDispositionKhoId}
          options={khos.map((x) => ({ value: x.id, label: x.tenKho }))} />}
        {dispositionType === 'NHAP_THAY_THE' && <Select style={{ width: '100%' }}
          showSearch optionFilterProp="label" placeholder="Chọn phiếu nhập thay thế đã xác nhận"
          value={dispositionReceiptId} onChange={setDispositionReceiptId}
          options={receipts.filter((x) => x.trangThai === 'DA_NHAP_KHO'
            && x.nhaCungCapId === disposing?.nhaCungCapId)
            .map((x) => ({ value: x.id, label: `${x.maPn} · ${x.tenKho}` }))} />}
        <Input.TextArea maxLength={500} rows={3} placeholder="Ghi chú kết quả xử lý"
          value={dispositionNote} onChange={(e) => setDispositionNote(e.target.value)} />
      </Space>
    </Modal>
  </Space>;
}
