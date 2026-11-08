import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import { api } from '../../services/api';

const errorText = (e) => e.response?.data?.message || e.message || 'Không thể xử lý biên nhận.';

export default function IntakeConfirmationPanel({ ticketId, ticketStatus, onConfirmed }) {
  const [photos, setPhotos] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [minimum, setMinimum] = useState(2);
  const [intakeFiles, setIntakeFiles] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [signer, setSigner] = useState('');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const intakeInput = useRef(null);
  const receiptInput = useRef(null);

  const reload = useCallback(async () => {
    if (!ticketId) return;
    try {
      const [images, policy, signed] = await Promise.all([
        api.getAnhPhieu(ticketId),
        api.getQuyTacVanHanh(),
        api.getXacNhanTiepNhan(ticketId).catch((e) => {
          if (e.response?.status === 404) return { data: null };
          throw e;
        }),
      ]);
      setPhotos(images.data || []);
      setMinimum(policy.data?.anhTiepNhanToiThieu || 2);
      setConfirmation(signed.data || null);
    } catch (e) { message.error(errorText(e)); }
  }, [ticketId]);

  useEffect(() => { Promise.resolve().then(reload); }, [reload]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const upload = async (files, kind, description) => {
    if (!files.length) { message.warning('Chọn ảnh trước khi tải lên.'); return; }
    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      message.warning('Mỗi ảnh tối đa 5 MB.'); return;
    }
    setBusy(true);
    try {
      let lastId = null;
      for (const file of files) {
        const data = new FormData();
        data.append('file', file);
        data.append('loai', kind);
        data.append('moTa', description);
        const result = await api.taiAnhPhieu(ticketId, data);
        lastId = result.data?.id;
      }
      if (kind === 'KHAC') setReceiptId(lastId);
      if (kind === 'KHAC') {
        setReceiptFile(null);
        if (receiptInput.current) receiptInput.current.value = '';
      } else {
        setIntakeFiles([]);
        if (intakeInput.current) intakeInput.current.value = '';
      }
      message.success(`Đã lưu ${files.length} ảnh.`);
    } catch (e) { message.error(errorText(e)); }
    finally { await reload(); setBusy(false); }
  };

  const confirm = async () => {
    if (photos.filter((x) => x.loai === 'LUC_TIEP_NHAN').length < minimum) {
      message.warning(`Cần ít nhất ${minimum} ảnh tình trạng lúc nhận.`); return;
    }
    if (!receiptId || !signer.trim()) {
      message.warning('Chọn ảnh biên nhận đã ký và nhập tên người ký.'); return;
    }
    setBusy(true);
    try {
      const result = await api.xacNhanTiepNhan(ticketId,
        { nguoiXacNhan: signer.trim(), anhBienNhanId: receiptId });
      setConfirmation(result.data);
      message.success('Đã ghi nhận biên nhận; kỹ thuật viên có thể nhận máy.');
      onConfirmed?.();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const viewPhoto = async (id) => {
    try {
      const blob = await api.getAnhPhieuFile(ticketId, id);
      setPreview(URL.createObjectURL(blob));
    } catch (e) { message.error(errorText(e)); }
  };

  const intakeCount = photos.filter((x) => x.loai === 'LUC_TIEP_NHAN').length;
  const editable = !confirmation && ticketStatus === 'TIEP_NHAN';
  return <Card size="small" title="Bằng chứng và xác nhận tiếp nhận"
    extra={<Button size="small" onClick={reload}>Làm mới</Button>}>
    {confirmation
      ? <Alert type="success" showIcon message={`Đã xác nhận bởi ${confirmation.nguoiXacNhan}`}
          description={`Ảnh biên nhận #${confirmation.anhBienNhanId}. Ảnh đầu vào đã được khóa.`} />
      : <Alert type="warning" showIcon
          message={`Cần ${minimum} ảnh lúc nhận, hiện có ${intakeCount}`}
          description="Tải ảnh máy, tem serial và ảnh biên nhận khách đã ký. Người ghi nhận xác nhận phải tự tải ảnh biên nhận. Kỹ thuật viên chỉ nhận máy sau khi hoàn tất bước này." />}
    <Table size="small" style={{ marginTop: 12 }} dataSource={photos} rowKey="id"
      pagination={{ pageSize: 5 }} columns={[
        { title: 'Ảnh', dataIndex: 'id', render: (id) => `#${id}` },
        { title: 'Loại', dataIndex: 'loai', render: (v) => <Tag>{v}</Tag> },
        { title: 'Mô tả', dataIndex: 'moTa', render: (v) => v || '—' },
        { title: '', render: (_, row) => <Button size="small" onClick={() => viewPhoto(row.id)}>Xem</Button> },
      ]} />
    {editable && <Space direction="vertical" style={{ width: '100%' }}>
      <Space wrap>
        <input ref={intakeInput} type="file" multiple accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setIntakeFiles(Array.from(e.target.files || []))} />
        <Button loading={busy} onClick={() => upload(intakeFiles, 'LUC_TIEP_NHAN', 'Tình trạng lúc nhận')}>
          Tải ảnh lúc nhận
        </Button>
      </Space>
      <Space wrap>
        <input ref={receiptInput} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
        <Button loading={busy} onClick={() => upload(receiptFile ? [receiptFile] : [],
          'KHAC', 'Biên nhận tiếp nhận có chữ ký khách')}>
          Tải biên nhận đã ký
        </Button>
      </Space>
      <Space wrap>
        <Select style={{ width: 250 }} value={receiptId} onChange={setReceiptId}
          placeholder="Chọn ảnh biên nhận đã ký" options={photos.filter((x) => x.loai === 'KHAC')
            .map((x) => ({ value: x.id, label: `#${x.id} · ${x.moTa || 'Ảnh khác'}` }))} />
        <Input style={{ width: 240 }} maxLength={150} placeholder="Tên người ký biên nhận"
          value={signer} onChange={(e) => setSigner(e.target.value)} />
        <Button type="primary" disabled={intakeCount < minimum || !receiptId || !signer.trim()}
          loading={busy} onClick={confirm}>Ghi nhận xác nhận</Button>
      </Space>
    </Space>}
    <Modal open={!!preview} footer={null} onCancel={() => setPreview(null)} title="Ảnh biên nhận">
      {preview && <img src={preview} alt="Ảnh tiếp nhận" style={{ maxWidth: '100%' }} />}
    </Modal>
  </Card>;
}
