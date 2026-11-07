import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Modal, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import VatTuTab from './VatTuTab';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const { Title, Text } = Typography;
const transitions = {
  TIEP_NHAN: ['DANG_SUA'], DANG_SUA: ['CHO_LINH_KIEN', 'HOAN_THANH'],
  CHO_LINH_KIEN: ['DANG_SUA'],
};
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';

export default function TechnicianPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [issued, setIssued] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setTickets((await api.getPhieuSuaChua()).data || []); }
    catch (e) { message.error(errorText(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    api.getPhieuSuaChua().then((r) => { if (active) setTickets(r.data || []); })
      .catch((e) => message.error(errorText(e)));
    return () => { active = false; };
  }, []);

  const open = async (ticket) => {
    setSelected(ticket);
    setDiagnosis(ticket.ketQuaKiemTra || '');
    form.resetFields();
    try {
      const [detail, parts] = await Promise.all([
        api.getChiTietPhieuSuaChua(ticket.id), api.getXuatKhoPhieu(ticket.id),
      ]);
      setSelected(detail.data);
      setDiagnosis(detail.data.ketQuaKiemTra || '');
      setIssued(parts.data || []);
    }
    catch (e) { message.error(errorText(e)); }
  };

  const refreshSelected = async () => {
    const detail = (await api.getChiTietPhieuSuaChua(selected.id)).data;
    setSelected(detail);
    setDiagnosis(detail.ketQuaKiemTra || '');
    await reload();
  };

  const receive = async () => {
    setBusy(true);
    try { await api.xacNhanNhanMay(selected.id); await refreshSelected(); message.success('Đã xác nhận nhận máy.'); }
    catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const saveDiagnosis = async () => {
    if (!diagnosis.trim()) { message.warning('Nhập kết quả kiểm tra.'); return; }
    setBusy(true);
    try {
      await api.luuKetQuaKiemTra(selected.id, diagnosis.trim());
      await refreshSelected();
      message.success('Đã lưu kết quả kiểm tra.');
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const submit = async (v) => {
    setBusy(true);
    try {
      await api.capNhatTrangThaiPhieu(selected.id, {
        trangThai: v.trangThai, ghiChu: v.ghiChu || null,
        ketQuaSuaChua: v.trangThai === 'HOAN_THANH' ? v.ketQuaSuaChua : null,
      });
      message.success('Đã cập nhật phiếu sửa chữa.');
      setSelected(null);
      await reload();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  return <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <Title level={3}>Bàn làm việc kỹ thuật viên</Title>
    <Tabs items={[
      { key: 'jobs', label: 'Phiếu sửa chữa', children: <>
        <Button onClick={reload} style={{ marginBottom: 12 }}>Làm mới</Button>
        <Table dataSource={tickets} loading={loading} rowKey="id" pagination={{ pageSize: 10 }}
          scroll={{ x: 850 }} columns={[
            { title: 'Mã phiếu', dataIndex: 'maPhieu' },
            { title: 'Thiết bị', dataIndex: 'tenThietBi' },
            { title: 'Lỗi khách báo', dataIndex: 'tinhTrangLoi' },
            { title: 'Ngày nhận', dataIndex: 'ngayNhan', render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm') },
            { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
            { title: '', render: (_, row) => <Button onClick={() => open(row)}>Xử lý</Button> },
          ]} />
      </> },
      { key: 'materials', label: 'Yêu cầu vật tư', children: <VatTuTab /> },
    ]} />
    <Modal open={!!selected} title={selected?.maPhieu} onCancel={() => setSelected(null)}
      onOk={() => form.submit()} okText="Lưu trạng thái" confirmLoading={busy}
      okButtonProps={{ disabled: !(transitions[selected?.trangThai] || []).length ||
        (selected?.trangThai === 'TIEP_NHAN' &&
          (!selected?.ktvNhanLuc || !selected?.ketQuaKiemTra || selected?.baoGiaMoiNhatTrangThai !== 'DA_DUYET')) }}>
      {selected && <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small">
          <Text strong>{selected.tenThietBi}</Text><br />
          <Text>Lỗi: {selected.tinhTrangLoi}</Text><br />
          <Text>Ngoại quan: {selected.tinhTrangNgoaiQuan || '—'}</Text><br />
          <Text>Phụ kiện gửi kèm: {selected.phuKienKemTheo || '—'}</Text>
        </Card>
        <Card size="small" title="Nhận máy và kiểm tra ban đầu"
          extra={<Button size="small" onClick={() => refreshSelected().catch((e) => message.error(errorText(e)))}>Làm mới</Button>}>
          {selected.ktvNhanLuc
            ? <Text type="success">Đã nhận máy lúc {dayjs(selected.ktvNhanLuc).format('DD/MM/YYYY HH:mm')}</Text>
            : user?.role === 'technician' && selected.trangThai === 'TIEP_NHAN'
              ? <Button type="primary" onClick={receive} loading={busy}>Xác nhận đã nhận máy</Button>
              : <Text type="secondary">Chờ KTV phụ trách xác nhận nhận máy.</Text>}
          <Input.TextArea rows={3} maxLength={1000} style={{ marginTop: 12 }}
            value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="Kết quả kiểm tra và hạng mục cần sửa"
            disabled={user?.role !== 'technician' || !selected.ktvNhanLuc || busy || selected.trangThai !== 'TIEP_NHAN'} />
          {user?.role === 'technician' && <Button style={{ marginTop: 8 }} onClick={saveDiagnosis}
            loading={busy} disabled={!selected.ktvNhanLuc || !diagnosis.trim() || selected.trangThai !== 'TIEP_NHAN'}>
            Lưu kết quả kiểm tra
          </Button>}
          {selected.trangThai === 'TIEP_NHAN' && <Alert style={{ marginTop: 12 }}
            type={selected.ktvNhanLuc && selected.ketQuaKiemTra && selected.baoGiaMoiNhatTrangThai === 'DA_DUYET' ? 'success' : 'info'}
            showIcon message={`Báo giá mới nhất: ${selected.baoGiaMoiNhatTrangThai || 'Chưa có'}`}
            description="Sau khi KTV nhận máy, ghi kết quả kiểm tra và khách duyệt báo giá, phiếu mới được chuyển sang đang sửa." />}
        </Card>
        <Card size="small" title="Linh kiện đã xuất">
          <Table dataSource={issued} rowKey="chiTietXuatKhoId" size="small" pagination={false} columns={[
            { title: 'Linh kiện', dataIndex: 'tenLinhKien' },
            { title: 'Số lượng', dataIndex: 'soLuongXuat' },
            { title: 'Serial', dataIndex: 'soSerial', render: (v) => v || '—' },
          ]} />
        </Card>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="trangThai" label="Chuyển sang" rules={[{ required: true }]}>
            <Select options={(transitions[selected.trangThai] || []).map((x) => ({ value: x, label: x }))} />
          </Form.Item>
          <Form.Item name="ghiChu" label="Ghi chú xử lý"><Input.TextArea rows={2} maxLength={500} /></Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.trangThai !== c.trangThai}>{({ getFieldValue }) =>
            getFieldValue('trangThai') === 'HOAN_THANH' && <Form.Item name="ketQuaSuaChua" label="Kết quả sửa chữa" rules={[{ required: true }]}>
              <Input.TextArea rows={3} maxLength={1000} />
            </Form.Item>}
          </Form.Item>
        </Form>
      </Space>}
    </Modal>
  </Space>;
}
