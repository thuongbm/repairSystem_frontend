import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import VatTuTab from './VatTuTab';
import { api } from '../../services/api';

const { Title, Text } = Typography;
const transitions = {
  TIEP_NHAN: ['DANG_SUA'], DANG_SUA: ['CHO_LINH_KIEN', 'HOAN_THANH'],
  CHO_LINH_KIEN: ['DANG_SUA'],
};
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';

export default function TechnicianPage() {
  const [form] = Form.useForm();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [issued, setIssued] = useState([]);
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
    form.resetFields();
    try { setIssued((await api.getXuatKhoPhieu(ticket.id)).data || []); }
    catch (e) { message.error(errorText(e)); }
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
      okButtonProps={{ disabled: !(transitions[selected?.trangThai] || []).length }}>
      {selected && <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small">
          <Text strong>{selected.tenThietBi}</Text><br />
          <Text>Lỗi: {selected.tinhTrangLoi}</Text><br />
          <Text>Ngoại quan: {selected.tinhTrangNgoaiQuan || '—'}</Text><br />
          <Text>Phụ kiện gửi kèm: {selected.phuKienKemTheo || '—'}</Text>
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
