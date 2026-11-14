import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const { Title } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';

export default function PricingPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try { setRows((await api.getDichVu()).data || []); setLoadError(''); }
    catch { setLoadError('Không tải được danh mục dịch vụ. Dữ liệu đang hiển thị có thể đã cũ.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { Promise.resolve().then(reload); }, [reload]);

  const edit = (row) => {
    setEditing(row || null);
    form.resetFields();
    if (row) form.setFieldsValue(row);
    setOpen(true);
  };

  const submit = async (values) => {
    setBusy(true);
    try {
      if (editing) await api.capNhatDichVu(editing.id, values);
      else await api.taoDichVu(values);
      message.success('Đã lưu dịch vụ.');
      setOpen(false); form.resetFields(); await reload();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  return <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <Title level={3}>Danh mục và giá dịch vụ</Title>
    {loadError && <Alert type="warning" showIcon message={loadError}
      action={<Button size="small" onClick={reload}>Thử lại</Button>} />}
    <Space><Button onClick={reload}>Làm mới</Button>
      {user?.role === 'admin' && <Button type="primary" onClick={() => edit(null)}>Thêm dịch vụ</Button>}</Space>
    <Table dataSource={rows} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
      { title: 'Mã', dataIndex: 'maDv' }, { title: 'Tên dịch vụ', dataIndex: 'tenDichVu' },
      { title: 'Mô tả', dataIndex: 'moTa' },
      { title: 'Giá niêm yết', dataIndex: 'giaNiemYet', render: (v) => `${Number(v).toLocaleString('vi-VN')} ₫` },
      { title: '', render: (_, row) => user?.role === 'admin' && <Space>
        <Button size="small" onClick={() => edit(row)}>Sửa</Button>
        <Popconfirm title="Ngừng dùng dịch vụ này?" onConfirm={async () => {
          try { await api.xoaDichVu(row.id); message.success('Đã ngừng dùng dịch vụ.'); await reload(); }
          catch (e) { message.error(errorText(e)); }
        }}><Button size="small" danger>Ngừng dùng</Button></Popconfirm>
      </Space> },
    ]} />
    <Modal open={open} title={editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      onCancel={() => setOpen(false)} onOk={() => form.submit()} confirmLoading={busy} okText="Lưu">
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="tenDichVu" label="Tên dịch vụ" rules={[{ required: true }]}><Input maxLength={150} /></Form.Item>
        <Form.Item name="moTa" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="giaNiemYet" label="Giá niêm yết" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  </Space>;
}
