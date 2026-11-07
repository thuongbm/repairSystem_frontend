import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, DatePicker, Drawer, Form, Input, Popconfirm,
  Space, Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { api } from '../../services/api';

const { Title, Text } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const money = (v) => `${Number(v || 0).toLocaleString('vi-VN')} ₫`;
const dateTime = (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—';

export default function CustomerPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isCustomer = user?.role === 'customer';
  const [bookingForm] = Form.useForm();
  const [services, setServices] = useState([]);
  const [serial, setSerial] = useState('');
  const [serialResult, setSerialResult] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const reloadMine = useCallback(async () => {
    if (!isCustomer) return;
    setLoading(true);
    try {
      const [t, a, w] = await Promise.allSettled([
        api.getPhieuCuaToi(), api.getLichHenCuaToi(), api.getBaoHanhCuaToi(),
      ]);
      setTickets(t.status === 'fulfilled' ? t.value.data || [] : []);
      setAppointments(a.status === 'fulfilled' ? a.value.data || [] : []);
      setWarranties(w.status === 'fulfilled' ? w.value.data || [] : []);
      const failed = [t, a, w].find((x) => x.status === 'rejected');
      if (failed) message.error(errorText(failed.reason));
      setLoadedFor(user?.id);
    } catch (e) { message.error(errorText(e)); }
    finally { setLoading(false); }
  }, [isCustomer, user]);

  useEffect(() => {
    let active = true;
    api.getDichVu().then((r) => { if (active) setServices(r.data || []); })
      .catch(() => message.error('Không tải được danh mục dịch vụ.'));
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (isCustomer) Promise.resolve().then(reloadMine);
  }, [isCustomer, user?.id, reloadMine]);

  const lookupSerial = async () => {
    if (!serial.trim()) { message.warning('Nhập serial linh kiện.'); return; }
    setBusy(true); setSerialResult(null);
    try { setSerialResult((await api.traCuuBaoHanhSerial(serial.trim())).data); }
    catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const openTicket = async (id) => {
    setSelectedId(id); setDetail(null);
    try { setDetail((await api.getChiTietPhieuCuaToi(id)).data); }
    catch (e) { message.error(errorText(e)); setSelectedId(null); }
  };
  const replyQuote = async (decision) => {
    const id = detail?.baoGia?.id;
    if (!id) return;
    setBusy(true);
    try {
      await api.phanHoiBaoGiaKhach(id, {
        quyetDinh: decision,
        noiDung: decision === 'DA_DUYET' ? 'Khách xác nhận trên cổng khách hàng' : 'Khách từ chối trên cổng khách hàng',
      });
      message.success('Đã ghi nhận phản hồi báo giá.');
      await openTicket(selectedId);
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const book = async (v) => {
    setBusy(true);
    try {
      await api.datLichHen({
        thoiGianMongMuon: v.thoiGianMongMuon.toISOString(),
        tenThietBi: v.tenThietBi.trim(), moTaLoi: v.moTaLoi.trim(),
      });
      bookingForm.resetFields();
      message.success('Đã gửi yêu cầu đặt lịch. Lễ tân sẽ xác nhận.');
      await reloadMine();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const cancelAppointment = async (id) => {
    setBusy(true);
    try { await api.huyLichHen(id); message.success('Đã hủy lịch hẹn.'); await reloadMine(); }
    catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const publicTab = <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <Alert type="info" showIcon message="Tiếp nhận tại cửa hàng"
      description="Giá niêm yết để tham khảo. Nhân viên kiểm tra máy và lập báo giá trước khi sửa." />
    <Card title="Giá dịch vụ hiện có">
      <Table dataSource={services} rowKey="id" pagination={{ pageSize: 10 }} columns={[
        { title: 'Dịch vụ', dataIndex: 'tenDichVu' },
        { title: 'Mô tả', dataIndex: 'moTa' },
        { title: 'Giá niêm yết', dataIndex: 'giaNiemYet', render: money },
      ]} />
    </Card>
    <Card title="Tra cứu bảo hành linh kiện theo serial">
      <Space.Compact style={{ width: '100%', maxWidth: 520 }}>
        <Input value={serial} onChange={(e) => setSerial(e.target.value)}
          onPressEnter={lookupSerial} placeholder="Nhập serial trên linh kiện" />
        <Button type="primary" onClick={lookupSerial} loading={busy}>Tra cứu</Button>
      </Space.Compact>
      {serialResult && <div style={{ marginTop: 16 }}>
        <Text strong>{serialResult.tenLinhKien} — {serialResult.soSerial}</Text><br />
        <Text>{serialResult.thongBao}</Text>
      </div>}
    </Card>
  </Space>;

  const repairsTab = <Card title="Phiếu sửa chữa của tôi" extra={<Button onClick={reloadMine} loading={loading}>Làm mới</Button>}>
    <Table dataSource={loadedFor === user?.id ? tickets : []} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} columns={[
      { title: 'Mã phiếu', dataIndex: 'maPhieu' },
      { title: 'Thiết bị', dataIndex: 'tenThietBi' },
      { title: 'Ngày nhận', dataIndex: 'ngayNhan', render: dateTime },
      { title: 'Hẹn trả', dataIndex: 'ngayHenTra', render: dateTime },
      { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
      { title: '', render: (_, row) => <Button onClick={() => openTicket(row.id)}>Xem tiến độ</Button> },
    ]} />
  </Card>;

  const appointmentsTab = <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <Card title="Đặt lịch mang máy đến">
      <Form form={bookingForm} layout="vertical" onFinish={book}>
        <Form.Item name="thoiGianMongMuon" label="Thời gian mong muốn"
          rules={[{ required: true, message: 'Chọn thời gian đến cửa hàng.' },
            { validator: (_, v) => !v || v.isAfter(dayjs().add(1, 'hour'))
              ? Promise.resolve() : Promise.reject(new Error('Chọn thời gian sau ít nhất 1 giờ.')) }]}>
          <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }}
            disabledDate={(d) => d && d.isBefore(dayjs(), 'day')} />
        </Form.Item>
        <Form.Item name="tenThietBi" label="Thiết bị" rules={[{ required: true }]}>
          <Input maxLength={150} placeholder="Ví dụ: Laptop Dell Inspiron" />
        </Form.Item>
        <Form.Item name="moTaLoi" label="Mô tả lỗi" rules={[{ required: true }]}>
          <Input.TextArea maxLength={1000} rows={3} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Gửi lịch hẹn</Button>
      </Form>
    </Card>
    <Card title="Lịch hẹn của tôi">
      <Table dataSource={loadedFor === user?.id ? appointments : []} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} columns={[
        { title: 'Thời gian', dataIndex: 'thoiGianMongMuon', render: dateTime },
        { title: 'Thiết bị', dataIndex: 'tenThietBi' },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
        { title: 'Ghi chú lễ tân', dataIndex: 'ghiChu', render: (v) => v || '—' },
        { title: '', render: (_, row) => ['CHO_XAC_NHAN', 'DA_XAC_NHAN'].includes(row.trangThai)
          && dayjs(row.thoiGianMongMuon).isAfter(dayjs())
          ? <Popconfirm title="Hủy lịch hẹn này?" onConfirm={() => cancelAppointment(row.id)}>
            <Button danger size="small">Hủy</Button></Popconfirm> : null },
      ]} />
    </Card>
  </Space>;

  const guestAppointmentsTab = <Card title="Đặt lịch mang máy đến">
    <Space direction="vertical" size="middle">
      <Text>Đăng ký hoặc đăng nhập tài khoản khách hàng để gửi lịch hẹn và theo dõi phản hồi của lễ tân.</Text>
      <Button type="primary" onClick={() => navigate('/login', { state: { returnToBooking: true } })}>
        Đăng nhập / đăng ký để đặt lịch
      </Button>
    </Space>
  </Card>;

  const warrantiesTab = <Card title="Bảo hành của tôi">
    <Table dataSource={loadedFor === user?.id ? warranties : []} loading={loading} rowKey="id" pagination={{ pageSize: 8 }} columns={[
      { title: 'Mã', dataIndex: 'id', render: (v) => `#${v}` },
      { title: 'Ngày tiếp nhận', dataIndex: 'ngayTiepNhan', render: dateTime },
      { title: 'Lỗi đã báo', dataIndex: 'loiKhachBao' },
      { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
      { title: 'Kết quả', dataIndex: 'ketQuaXuLy', render: (v) => v || '—' },
    ]} />
  </Card>;

  return <div style={{ maxWidth: 1180, margin: '32px auto', padding: '0 20px' }}>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={2} style={{ margin: 0 }}>Dịch vụ sửa chữa thiết bị</Title>
        {user ? <Space><Text>{user.name}</Text><Button onClick={() => {
          setSelectedId(null); setDetail(null); setLoadedFor(null);
          logout(); navigate('/');
        }}>Đăng xuất</Button></Space> : <Button onClick={() => navigate('/login')}>Đăng nhập / đăng ký</Button>}
      </Space>
      {!isCustomer && user && <Alert type="info" showIcon message="Tài khoản nhân viên"
        description="Mở bảng điều khiển để xử lý nghiệp vụ."
        action={<Button onClick={() => navigate('/dashboard')}>Bảng điều khiển</Button>} />}
      <Tabs defaultActiveKey={isCustomer && new URLSearchParams(location.search).get('tab') === 'appointments'
        ? 'appointments' : 'services'} items={[
        { key: 'services', label: 'Dịch vụ và tra cứu serial', children: publicTab },
        ...(!user ? [{ key: 'appointments', label: 'Đặt lịch', children: guestAppointmentsTab }] : []),
        ...(isCustomer ? [
          { key: 'repairs', label: 'Phiếu của tôi', children: repairsTab },
          { key: 'appointments', label: 'Đặt lịch', children: appointmentsTab },
          { key: 'warranties', label: 'Bảo hành của tôi', children: warrantiesTab },
        ] : []),
      ]} />
    </Space>
    <Drawer open={!!selectedId} width="min(820px, 100vw)" onClose={() => { setSelectedId(null); setDetail(null); }}
      title={detail?.phieu?.maPhieu || 'Đang tải phiếu'}>
      {detail && <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card size="small" title="Tiến độ sửa chữa">
          <Text strong>{detail.phieu.tenThietBi}</Text><br />
          <Text>Trạng thái: <Tag>{detail.phieu.trangThai}</Tag></Text><br />
          <Text>Ngày nhận: {dateTime(detail.phieu.ngayNhan)} · Hẹn trả: {dateTime(detail.phieu.ngayHenTra)}</Text><br />
          <Text>Lỗi đã báo: {detail.phieu.tinhTrangLoi}</Text><br />
          <Text>Kết quả sửa: {detail.phieu.ketQuaSuaChua || 'Đang cập nhật'}</Text>
          <Table size="small" style={{ marginTop: 12 }} dataSource={detail.lichSu || []}
            rowKey={(_, i) => String(i)} pagination={false} columns={[
              { title: 'Thời gian', dataIndex: 'thoiGian', render: dateTime },
              { title: 'Trạng thái', dataIndex: 'trangThaiMoi', render: (v) => <Tag>{v}</Tag> },
            ]} />
        </Card>
        {detail.baoGia && <Card size="small" title={`Báo giá #${detail.baoGia.phienBan} — ${detail.baoGia.trangThai}`}>
          <Table size="small" dataSource={detail.baoGia.chiTiet || []}
            rowKey={(_, i) => String(i)} pagination={false} columns={[
              { title: 'Hạng mục', dataIndex: 'tenHangMuc' },
              { title: 'Số lượng', dataIndex: 'soLuong' },
              { title: 'Đơn giá', dataIndex: 'donGia', render: money },
              { title: 'Thành tiền', render: (_, row) => money(row.soLuong * row.donGia) },
            ]} />
          <Text>Giảm giá: {money(detail.baoGia.giamGia)}</Text>
          <br /><Text strong>Tổng báo giá: {money((detail.baoGia.chiTiet || [])
            .reduce((sum, x) => sum + Number(x.soLuong) * Number(x.donGia), 0)
            - Number(detail.baoGia.giamGia || 0))}</Text>
          {detail.baoGia.trangThai === 'CHO_DUYET' && <Space style={{ display: 'flex', marginTop: 12 }}>
            <Popconfirm title="Đồng ý báo giá này?" onConfirm={() => replyQuote('DA_DUYET')}>
              <Button type="primary" loading={busy}>Đồng ý</Button></Popconfirm>
            <Popconfirm title="Từ chối báo giá này?" onConfirm={() => replyQuote('TU_CHOI')}>
              <Button danger loading={busy}>Từ chối</Button></Popconfirm>
          </Space>}
        </Card>}
      </Space>}
    </Drawer>
  </div>;
}
