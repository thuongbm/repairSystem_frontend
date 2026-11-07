import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Popconfirm, Select, Space, Table, message } from 'antd';
import { api } from '../services/api';

const errorText = (e) => e.response?.data?.message || e.message || 'Không xử lý được ảnh.';

export default function TicketPhotos({ ticketId, role, ticketStatus }) {
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [kind, setKind] = useState(role === 'technician' ? 'SAU_SUA' : 'LUC_TIEP_NHAN');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const canDelete = ['admin', 'receptionist'].includes(role) && !['DA_TRA', 'HUY'].includes(ticketStatus);

  const reload = useCallback(async () => {
    if (!ticketId) return;
    try { setRows((await api.getAnhPhieu(ticketId)).data || []); }
    catch (e) { message.error(errorText(e)); }
  }, [ticketId]);

  useEffect(() => { Promise.resolve().then(reload); }, [reload]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const upload = async () => {
    if (!file) { message.warning('Chọn ảnh trước khi tải lên.'); return; }
    const form = new FormData();
    form.append('file', file); form.append('loai', kind); form.append('moTa', description);
    setBusy(true);
    try {
      await api.taiAnhPhieu(ticketId, form);
      setFile(null); setDescription('');
      const input = document.getElementById(`ticket-photo-${ticketId}`);
      if (input) input.value = '';
      message.success('Đã lưu ảnh phiếu.');
      await reload();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const openPreview = async (id) => {
    setBusy(true);
    try {
      const blob = await api.getAnhPhieuFile(ticketId, id);
      setPreview(URL.createObjectURL(blob));
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    setBusy(true);
    try { await api.xoaAnhPhieu(ticketId, id); message.success('Đã xóa ảnh.'); await reload(); }
    catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  return <Card size="small" title="Ảnh tình trạng thiết bị" extra={<Button onClick={reload}>Làm mới</Button>}>
    <Table size="small" dataSource={rows} rowKey="id" pagination={{ pageSize: 8 }} columns={[
      { title: 'Loại', dataIndex: 'loai' },
      { title: 'Mô tả', dataIndex: 'moTa', render: (v) => v || '—' },
      { title: 'Thời gian', dataIndex: 'createdAt', render: (v) => v ? new Date(v).toLocaleString('vi-VN') : '—' },
      { title: '', render: (_, row) => <Space>
        <Button size="small" onClick={() => openPreview(row.id)}>Xem</Button>
        {canDelete && <Popconfirm title="Xóa ảnh này?" onConfirm={() => remove(row.id)}>
          <Button size="small" danger>Xóa</Button></Popconfirm>}
      </Space> },
    ]} />
    {ticketStatus !== 'DA_TRA' && ticketStatus !== 'HUY' && <Space wrap style={{ marginTop: 12 }}>
      <input id={`ticket-photo-${ticketId}`} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const chosen = e.target.files?.[0] || null;
          if (chosen && chosen.size > 5 * 1024 * 1024) {
            message.warning('Ảnh tối đa 5 MB.'); e.target.value = ''; setFile(null);
          } else setFile(chosen);
        }} />
      <Select value={kind} onChange={setKind} style={{ width: 160 }} options={role === 'technician'
        ? [{ value: 'SAU_SUA', label: 'Trong/sau sửa' }, { value: 'KHAC', label: 'Khác' }]
        : [{ value: 'LUC_TIEP_NHAN', label: 'Lúc tiếp nhận' },
          { value: 'SAU_SUA', label: 'Sau sửa' }, { value: 'KHAC', label: 'Khác' }]} />
      <Input style={{ width: 220 }} maxLength={255} placeholder="Mô tả ảnh"
        value={description} onChange={(e) => setDescription(e.target.value)} />
      <Button onClick={upload} loading={busy}>Tải ảnh lên</Button>
    </Space>}
    <Modal open={!!preview} footer={null} onCancel={() => setPreview(null)} width={800} title="Ảnh phiếu sửa chữa">
      {preview && <img src={preview} alt="Tình trạng thiết bị" style={{ maxWidth: '100%', maxHeight: '70vh' }} />}
    </Modal>
  </Card>;
}
