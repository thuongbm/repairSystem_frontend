import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import { api } from '../../services/api';

const { Title, Text } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;

export default function FinancialReconciliationPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState({ phieuNhap: [], hoaDonRa: [], congChoChi: [] });
  const [jobs, setJobs] = useState([]);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const [summary, work] = await Promise.all([
        api.getDoiSoatTaiChinhV3(), api.getCongViecSuaChuaV3(),
      ]);
      setData(summary.data || { phieuNhap: [], hoaDonRa: [], congChoChi: [] });
      setJobs(work.data || []);
    } catch (e) { message.error(errorText(e)); }
  }, []);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const open = (kind, job) => {
    setAction({ kind, job });
    form.resetFields();
    if (kind === 'approve') form.setFieldsValue({ soTien: job.congDeXuat });
    if (kind === 'pay') form.setFieldsValue({ phuongThuc: 'CHUYEN_KHOAN' });
  };
  const submit = async (values) => {
    setBusy(true);
    try {
      if (action.kind === 'approve') await api.duyetCongV3(action.job.id, values);
      else await api.chiTraCongV3(action.job.id, values);
      message.success('Đã cập nhật bảng công.');
      setAction(null); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const receipts = data.phieuNhap || [];
  const invoices = data.hoaDonRa || [];
  const proposed = jobs.filter((x) => x.congDeXuat != null && x.congDuyet == null);
  const unpaid = jobs.filter((x) => x.congDuyet != null && !x.chiTraLuc);

  return <div>
    <div className="page-heading">
      <div><Title level={3} style={{ margin: 0 }}>Đối soát tài chính</Title>
        <span>Hóa đơn, công nợ và bảng công thợ</span></div>
      <Button onClick={load}>Làm mới</Button>
    </div>
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      <Col xs={12} md={6}><Card><Statistic title="Phiếu nhập thiếu hóa đơn" value={receipts.filter((x) => !x.hoaDon).length} /></Card></Col>
      <Col xs={12} md={6}><Card><Statistic title="Hóa đơn đầu vào lệch" value={receipts.filter((x) => x.hoaDon?.trangThai === 'CHENH_LECH').length} /></Card></Col>
      <Col xs={12} md={6}><Card><Statistic title="Hóa đơn ra thiếu chứng từ" value={invoices.filter((x) => !x.chungTu).length} /></Card></Col>
      <Col xs={12} md={6}><Card><Statistic title="Công đã duyệt chưa chi" value={unpaid.length} /></Card></Col>
    </Row>
    <Tabs items={[
      { key: 'incoming', label: 'Nhập kho · hóa đơn vào', children: <Table size="small"
        dataSource={receipts} rowKey="id" pagination={{ pageSize: 10 }} columns={[
          { title: 'Phiếu nhập', dataIndex: 'maPn' },
          { title: 'Số hóa đơn', render: (_, x) => x.hoaDon?.soHoaDon || 'Chưa ghi' },
          { title: 'Trạng thái', render: (_, x) => <Tag color={x.hoaDon?.trangThai === 'KHOP' ? 'green' : 'orange'}>
            {x.hoaDon?.trangThai || 'THIEU_HOA_DON'}</Tag> },
          { title: 'Chênh lệch tiền hàng', render: (_, x) => x.hoaDon ? money(x.hoaDon.chenhLech) : '—' },
        ]} /> },
      { key: 'outgoing', label: 'Bán ra · công nợ', children: <Table size="small"
        dataSource={invoices} rowKey="id" pagination={{ pageSize: 10 }} columns={[
          { title: 'Hóa đơn nội bộ', dataIndex: 'maHd' },
          { title: 'Tổng', dataIndex: 'tongThanhToan', render: money },
          { title: 'Đã thu', dataIndex: 'daThu', render: money },
          { title: 'Còn nợ', dataIndex: 'conNo', render: money },
          { title: 'Chứng từ điện tử', render: (_, x) => x.chungTu?.soHoaDon || <Tag color="orange">Chưa ghi</Tag> },
          { title: 'Lệch chứng từ', dataIndex: 'chenhLechChungTu', render: (v) => v == null
            ? '—' : <Tag color={v === 0 ? 'green' : 'red'}>{money(v)}</Tag> },
        ]} /> },
      { key: 'pay', label: `Bảng công (${proposed.length + unpaid.length} cần xử lý)`, children: <Table size="small"
        dataSource={jobs} rowKey="id" pagination={{ pageSize: 10 }} columns={[
          { title: 'Việc / phiếu', render: (_, x) => `#${x.id} / #${x.phieuId}` },
          { title: 'Thợ', dataIndex: 'kyThuatVienId', render: (id) => `#${id}` },
          { title: 'Nội dung', dataIndex: 'moTa' },
          { title: 'Đề xuất', dataIndex: 'congDeXuat', render: (v) => v == null ? '—' : money(v) },
          { title: 'Được duyệt', dataIndex: 'congDuyet', render: (v) => v == null ? '—' : money(v) },
          { title: 'Chi trả', dataIndex: 'chiTraLuc', render: (v) => v ? <Tag color="green">Đã chi</Tag> : '—' },
          { title: '', render: (_, x) => <>
            {x.congDeXuat != null && x.congDuyet == null &&
              <Button size="small" onClick={() => open('approve', x)}>Duyệt công</Button>}
            {x.congDuyet != null && !x.chiTraLuc &&
              <Button size="small" onClick={() => open('pay', x)}>Ghi chi trả</Button>}
          </> },
        ]} /> },
    ]} />
    <Modal open={!!action} title={action?.kind === 'approve' ? 'Duyệt tiền công' : 'Ghi chi trả tiền công'}
      onCancel={() => setAction(null)} footer={null} destroyOnHidden>
      {action?.kind === 'pay' && <Text type="secondary">Thao tác này ghi nhận chứng từ; hệ thống không tự chuyển tiền.</Text>}
      <Form form={form} layout="vertical" onFinish={submit}>
        {action?.kind === 'approve' ? <>
          <Form.Item name="soTien" label="Số tiền được duyệt" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true, whitespace: true }]}>
            <Input.TextArea maxLength={500} rows={2} /></Form.Item>
        </> : <>
          <Form.Item name="phuongThuc" label="Phương thức" rules={[{ required: true }]}>
            <Select options={[{ value: 'CHUYEN_KHOAN', label: 'Chuyển khoản' },
              { value: 'TIEN_MAT', label: 'Tiền mặt' }]} /></Form.Item>
          <Form.Item name="maThamChieu" label="Mã chứng từ chi" rules={[{ required: true, whitespace: true }]}>
            <Input maxLength={100} /></Form.Item>
        </>}
        <Button type="primary" htmlType="submit" loading={busy}>Lưu</Button>
      </Form>
    </Modal>
  </div>;
}
