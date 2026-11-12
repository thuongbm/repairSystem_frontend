import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, DatePicker, Drawer, Form, Input, InputNumber, Modal,
  Popconfirm, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import IntakeModal from './IntakeModal';
import IntakeConfirmationPanel from './IntakeConfirmationPanel';
import OutgoingInvoicePanel from './OutgoingInvoicePanel';
import TicketPhotos from '../../components/TicketPhotos';
import WorkItemsPanel from '../repair/WorkItemsPanel';
import { useAuth } from '../../context/useAuth';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';

const { Title, Text } = Typography;
const money = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const parseChecklist = (value) => {
  try { return JSON.parse(value || 'null'); }
  catch { return null; }
};
const warrantyNext = {
  TIEP_NHAN: ['DANG_KIEM_TRA'], DANG_KIEM_TRA: ['CHAP_NHAN', 'TU_CHOI'],
  CHAP_NHAN: ['DANG_XU_LY'], DANG_XU_LY: ['HOAN_THANH'], HOAN_THANH: ['DA_TRA'],
};

export default function ReceptionPage() {
  const { user } = useAuth();
  const location = useLocation();
  const openedRoute = useRef('');
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [parts, setParts] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [linkingAppointment, setLinkingAppointment] = useState(null);
  const [linkTicketId, setLinkTicketId] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMatch, setCustomerMatch] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selected, setSelected] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [serviceLines, setServiceLines] = useState([]);
  const [exports, setExports] = useState([]);
  const [finance, setFinance] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [intakeConfirmation, setIntakeConfirmation] = useState(null);
  const [approvingClaim, setApprovingClaim] = useState(null);
  const [analysisClaim, setAnalysisClaim] = useState(null);
  const [linkingClaim, setLinkingClaim] = useState(null);
  const [approvalForm] = Form.useForm();
  const [analysisForm] = Form.useForm();
  const [linkClaimForm] = Form.useForm();
  const [quoteLines, setQuoteLines] = useState([]);
  const [quoteLineForm] = Form.useForm();
  const [quoteForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [handoverForm] = Form.useForm();
  const [commitmentForm] = Form.useForm();
  const [claimForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [assignmentForm] = Form.useForm();
  const [returnDateForm] = Form.useForm();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const list = (await api.getPhieuSuaChua()).data || [];
      setTickets(list);
      setSelected((current) => current ? list.find((x) => x.id === current.id) || current : null);
    }
    catch (e) { message.error(errorText(e)); }
    finally { setLoading(false); }
  }, []);

  const loadAppointments = useCallback(async (notifyOnError = true) => {
    try { setAppointments((await api.getLichHen()).data || []); }
    catch (e) { if (notifyOnError) message.error(errorText(e)); }
  }, []);

  const loadDetail = useCallback(async (id) => {
    try {
      const [q, s, x, f, c, w, intake] = await Promise.all([
        api.getBaoGiaV3(id), api.getDichVuPhieuV3(id), api.getXuatKhoPhieu(id),
        api.getTaiChinhV3(id), api.getCamKetBaoHanhV3(id),
        api.getBaoHanhKhachV3({ phieuId: id }),
        api.getXacNhanTiepNhan(id).catch((e) => {
          if (e.response?.status === 404) return { data: null };
          throw e;
        }),
      ]);
      setQuotes(q.data || []); setServiceLines(s.data || []); setExports(x.data || []);
      setFinance(f.data); setCommitments(c.data || []); setClaims(w.data || []);
      setIntakeConfirmation(intake.data || null);
    } catch (e) { message.error(errorText(e)); }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.getPhieuSuaChua(), api.getDichVu(), api.getLinhKien(),
      user?.role === 'admin' ? api.getNhanVien({ chucVu: 'LE_TAN' }) : Promise.resolve({ data: [] })])
      .then(([t, s, p, r]) => {
        if (!active) return;
        setTickets(t.data || []); setServices(s.data || []);
        setParts(p.data || []); setReceptionists(r.data || []);
      })
      .catch((e) => message.error(errorText(e)));
    api.getKyThuatVienPhanCong().then((r) => { if (active) setTechnicians(r.data || []); })
      .catch((e) => message.error(errorText(e)));
    return () => { active = false; };
  }, [user?.role]);

  useEffect(() => {
    Promise.resolve().then(() => loadAppointments());
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadAppointments(false);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadAppointments]);

  const perform = async (action, success) => {
    setBusy(true);
    try {
      await action();
      message.success(success);
      if (selected?.id) await loadDetail(selected.id);
      await loadTickets();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const openTicket = (row) => {
    setSelected(row);
    setIntakeConfirmation(null);
    assignmentForm.setFieldsValue({ kyThuatVienId: row.kyThuatVienId ?? null });
    returnDateForm.setFieldsValue({ ngayHenTra: row.ngayHenTra ? dayjs(row.ngayHenTra) : null });
    setCancelReason('');
    loadDetail(row.id);
  };

  useEffect(() => {
    const id = Number(new URLSearchParams(location.search).get('ticket'));
    if (!Number.isSafeInteger(id) || id <= 0) return;
    const routeKey = `${location.key}:${id}`;
    if (openedRoute.current === routeKey) return;
    const row = tickets.find((ticket) => ticket.id === id);
    if (!row) return;
    const timer = window.setTimeout(() => {
      openedRoute.current = routeKey;
      setSelected(row);
      setIntakeConfirmation(null);
      assignmentForm.setFieldsValue({ kyThuatVienId: row.kyThuatVienId ?? null });
      returnDateForm.setFieldsValue({ ngayHenTra: row.ngayHenTra ? dayjs(row.ngayHenTra) : null });
      setCancelReason('');
      loadDetail(row.id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.key, location.search, tickets, assignmentForm, returnDateForm, loadDetail]);

  const updateAppointment = async (id, payload) => {
    setBusy(true);
    try {
      await api.doiTrangThaiLichHen(id, payload);
      message.success('Đã cập nhật lịch hẹn.');
      setLinkingAppointment(null); setLinkTicketId(null);
      await loadAppointments();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const findCustomer = async () => {
    if (!customerPhone.trim()) { message.warning('Nhập số điện thoại khách.'); return; }
    setBusy(true); setCustomerMatch(null); setLinkCode(null);
    try { setCustomerMatch((await api.timKhachTheoDienThoai(customerPhone.trim())).data); }
    catch (e) { message.error(e.response?.status === 404
      ? 'Không tìm thấy hồ sơ khách hàng theo số điện thoại này.' : errorText(e)); }
    finally { setBusy(false); }
  };

  const issueLinkCode = async () => {
    if (!customerMatch?.id) return;
    setBusy(true);
    try { setLinkCode((await api.capMaLienKetKhach(customerMatch.id)).data); }
    catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const choices = [
    ...services.map((x) => ({ value: `D:${x.id}`, label: `Dịch vụ: ${x.tenDichVu}`,
      name: x.tenDichVu, price: x.giaNiemYet })),
    ...parts.map((x) => ({ value: `L:${x.id}`, label: `Linh kiện: ${x.tenLinhKien}`,
      name: x.tenLinhKien, price: x.donGiaBan })),
  ];

  const addQuoteLine = (values) => {
    const choice = choices.find((x) => x.value === values.itemKey);
    if (!choice) return;
    setQuoteLines((old) => [...old, {
      loai: values.itemKey.startsWith('D:') ? 'DICH_VU' : 'LINH_KIEN',
      dichVuId: values.itemKey.startsWith('D:') ? Number(values.itemKey.slice(2)) : null,
      linhKienId: values.itemKey.startsWith('L:') ? Number(values.itemKey.slice(2)) : null,
      tenHangMuc: choice.name, soLuong: values.soLuong, donGia: values.donGia,
    }]);
    quoteLineForm.resetFields(['itemKey', 'donGia']);
  };

  const quoteTab = <Space direction="vertical" style={{ width: '100%' }}>
    <Card size="small" title="Tạo báo giá mới">
      <Form form={quoteLineForm} layout="inline" onFinish={addQuoteLine}
        initialValues={{ soLuong: 1 }} style={{ gap: 8 }}>
        <Form.Item name="itemKey" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label" placeholder="Dịch vụ / linh kiện"
            style={{ width: 280 }} options={choices}
            onChange={(v) => quoteLineForm.setFieldValue('donGia', choices.find((x) => x.value === v)?.price)} />
        </Form.Item>
        <Form.Item name="soLuong" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
        <Form.Item name="donGia" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: 160 }} placeholder="Đơn giá" />
        </Form.Item>
        <Button htmlType="submit">Thêm dòng</Button>
      </Form>
      <Table size="small" style={{ marginTop: 12 }} dataSource={quoteLines}
        rowKey={(_, i) => String(i)} pagination={false} columns={[
          { title: 'Hạng mục', dataIndex: 'tenHangMuc' },
          { title: 'Số lượng', dataIndex: 'soLuong' },
          { title: 'Đơn giá', dataIndex: 'donGia', render: money },
          { title: '', render: (_, line) => <Button size="small" danger
            onClick={() => setQuoteLines((old) => old.filter((x) => x !== line))}>Bỏ</Button> },
        ]} />
      <Form form={quoteForm} layout="inline" onFinish={(v) => perform(async () => {
        await api.taoBaoGiaV3(selected.id, { giamGia: v.giamGia || 0, chiTiet: quoteLines });
        setQuoteLines([]); quoteForm.resetFields();
      }, 'Đã lưu báo giá nháp.')} initialValues={{ giamGia: 0 }} style={{ marginTop: 12 }}>
        <Form.Item name="giamGia" label="Giảm giá"><InputNumber min={0} /></Form.Item>
        <Button type="primary" htmlType="submit" disabled={!quoteLines.length} loading={busy}>Lưu báo giá</Button>
      </Form>
    </Card>
    {quotes.map((q) => <Card key={q.id} size="small"
      title={`Báo giá #${q.phienBan} — ${q.trangThai} — ${money(q.tongSauGiam)}`}
      extra={<Space>
        {q.trangThai === 'NHAP' && <Popconfirm title="Gửi báo giá cho khách?"
          onConfirm={() => perform(() => api.guiBaoGiaV3(selected.id, q.id), 'Đã chuyển sang chờ khách phản hồi.')}>
          <Button size="small">Đã gửi khách</Button></Popconfirm>}
        {q.trangThai === 'CHO_DUYET' && <>
          <Button size="small" type="primary" onClick={() => perform(() =>
            api.phanHoiBaoGiaV3(selected.id, q.id, { quyetDinh: 'DA_DUYET',
              kenhPhanHoi: 'TRUC_TIEP', noiDungPhanHoi: 'Khách xác nhận tại cửa hàng' }), 'Đã ghi nhận khách đồng ý.')}>Khách đồng ý</Button>
          <Button size="small" danger onClick={() => perform(() =>
            api.phanHoiBaoGiaV3(selected.id, q.id, { quyetDinh: 'TU_CHOI',
              kenhPhanHoi: 'TRUC_TIEP', noiDungPhanHoi: 'Khách không đồng ý' }), 'Đã ghi nhận khách từ chối.')}>Khách từ chối</Button>
        </>}
      </Space>}>
      <Table size="small" dataSource={q.chiTiet || []} rowKey="id" pagination={false} columns={[
        { title: 'Hạng mục', dataIndex: 'tenHangMuc' },
        { title: 'Số lượng', dataIndex: 'soLuong' },
        { title: 'Đơn giá', dataIndex: 'donGia', render: money },
        { title: 'Thành tiền', dataIndex: 'thanhTien', render: money },
        { title: '', render: (_, line) => q.trangThai === 'DA_DUYET' && line.loai === 'DICH_VU'
          && !serviceLines.some((x) => x.dichVuId === line.dichVuId)
          ? <Button size="small" onClick={() => perform(() => api.themDichVuPhieuV3(selected.id,
            { dichVuId: line.dichVuId, soLuong: line.soLuong }), 'Đã ghi dịch vụ vào phiếu.')}>Ghi dịch vụ</Button> : null },
      ]} />
    </Card>)}
  </Space>;

  const financeTab = <Space direction="vertical" style={{ width: '100%' }}>
    <Alert type="info" showIcon message={`Đã thu ròng: ${money(finance?.daThuRong)} · Còn nợ: ${finance?.conNo == null ? 'Chưa lập hóa đơn' : money(finance.conNo)}`} />
    <Card size="small" title="Dịch vụ và vật tư đã ghi">
      <Text>Dịch vụ: {serviceLines.map((x) => `${x.tenDichVu} × ${x.soLuong}`).join(', ') || 'Chưa có'}</Text><br />
      <Text>Vật tư xuất: {exports.length} dòng</Text>
    </Card>
    {!finance?.hoaDon && <Card size="small" title="Lập hóa đơn">
      <Form form={invoiceForm} layout="inline" onFinish={(v) => perform(() =>
        api.lapHoaDonV3(selected.id, { giamGia: v.giamGia || 0,
          leTanId: user?.role === 'admin' ? v.leTanId : null }), 'Đã lập hóa đơn.')}
      initialValues={{ giamGia: 0 }} style={{ gap: 8 }}>
        <Form.Item name="giamGia" label="Giảm giá"><InputNumber min={0} /></Form.Item>
        {user?.role === 'admin' && <Form.Item name="leTanId" label="Lễ tân" rules={[{ required: true }]}>
          <Select style={{ width: 180 }} options={receptionists.map((x) => ({ value: x.id, label: x.hoTen }))} />
        </Form.Item>}
        <Button type="primary" htmlType="submit" loading={busy}>Lập hóa đơn</Button>
      </Form>
    </Card>}
    {finance?.hoaDon && <Card size="small" title={`Hóa đơn ${finance.hoaDon.maHd} — ${money(finance.hoaDon.tongThanhToan)}`}>
      <Table size="small" dataSource={finance.hoaDon.chiTiet || []} rowKey="id" pagination={false} columns={[
        { title: 'Hạng mục', dataIndex: 'tenHangMuc' }, { title: 'SL', dataIndex: 'soLuong' },
        { title: 'Thành tiền', dataIndex: 'thanhTien', render: money },
      ]} />
    </Card>}
    {finance?.hoaDon && <OutgoingInvoicePanel invoice={finance.hoaDon} />}
    <Card size="small" title="Ghi nhận thu / hoàn tiền">
      <Form form={paymentForm} layout="inline" onFinish={(v) => perform(async () => {
        await api.ghiGiaoDichV3(selected.id, { ...v, hoaDonId: finance?.hoaDon?.id || null });
        paymentForm.resetFields(['soTien', 'maThamChieu', 'ghiChu']);
      }, 'Đã ghi giao dịch.')} initialValues={{ loai: 'THU', phuongThuc: 'TIEN_MAT' }} style={{ gap: 8 }}>
        <Form.Item name="loai"><Select style={{ width: 100 }} options={[{ value: 'THU', label: 'Thu' }, { value: 'HOAN', label: 'Hoàn' }]} /></Form.Item>
        <Form.Item name="soTien" rules={[{ required: true }]}><InputNumber min={1} placeholder="Số tiền" /></Form.Item>
        <Form.Item name="phuongThuc"><Select style={{ width: 160 }} options={[
          { value: 'TIEN_MAT', label: 'Tiền mặt' }, { value: 'CHUYEN_KHOAN', label: 'Chuyển khoản' },
          { value: 'THE', label: 'Thẻ' }, { value: 'VI_DIEN_TU', label: 'Ví điện tử' },
        ]} /></Form.Item>
        <Form.Item name="maThamChieu"><Input placeholder="Mã tham chiếu" maxLength={100} /></Form.Item>
        <Button htmlType="submit" loading={busy}>Ghi giao dịch</Button>
      </Form>
      <Table size="small" style={{ marginTop: 12 }} dataSource={finance?.giaoDich || []} rowKey="id" pagination={false} columns={[
        { title: 'Thời gian', dataIndex: 'thoiGian', render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm') },
        { title: 'Loại', dataIndex: 'loai' }, { title: 'Số tiền', dataIndex: 'soTien', render: money },
        { title: 'Phương thức', dataIndex: 'phuongThuc' }, { title: 'Tham chiếu', dataIndex: 'maThamChieu' },
      ]} />
    </Card>
    {!finance?.banGiao && <Card size="small" title="Bàn giao thiết bị">
      <Form form={handoverForm} layout="vertical" onFinish={(v) => perform(() =>
        api.banGiaoV3(selected.id, v), 'Đã bàn giao thiết bị.')}>
        <Form.Item name="tenNguoiNhan" label="Người nhận" rules={[{ required: true }]}><Input maxLength={150} /></Form.Item>
        <Form.Item name="tinhTrangMay" label="Tình trạng máy"><Input.TextArea maxLength={1000} /></Form.Item>
        <Form.Item name="phuKienDaTra" label="Phụ kiện đã trả"><Input maxLength={1000} /></Form.Item>
        <Form.Item name="xacNhan" label="Xác nhận của khách"><Input maxLength={1000} /></Form.Item>
        {user?.role === 'admin' && <Form.Item name="lyDoConNo" label="Lý do bàn giao còn nợ (nếu có)"><Input maxLength={500} /></Form.Item>}
        <Button type="primary" htmlType="submit" loading={busy}>Xác nhận bàn giao</Button>
      </Form>
    </Card>}
    {finance?.banGiao && <Tag color="green">Đã bàn giao cho {finance.banGiao.tenNguoiNhan}</Tag>}
  </Space>;

  const warrantyRepairTicketOptions = selected ? tickets.filter((x) =>
    x.id !== selected.id && x.thietBiId === selected.thietBiId).map((x) => ({
    value: x.id, label: x.maPhieu,
  })) : [];
  const warrantyTab = <Space direction="vertical" style={{ width: '100%' }}>
    <Card size="small" title="Cam kết bảo hành sau bàn giao">
      <Form form={commitmentForm} layout="inline" onFinish={(v) => perform(async () => {
        await api.taoCamKetBaoHanhV3({ phieuGocId: selected.id, loai: v.kind === 'service' ? 'DICH_VU' : 'LINH_KIEN',
          dichVuId: v.kind === 'service' ? v.itemId : null,
          chiTietXuatKhoId: v.kind === 'part' ? v.itemId : null,
          ngayBatDau: v.dates[0].format('YYYY-MM-DD'), ngayKetThuc: v.dates[1].format('YYYY-MM-DD'),
          dieuKien: v.dieuKien || null });
        commitmentForm.resetFields();
      }, 'Đã lưu cam kết bảo hành.')} style={{ gap: 8 }}>
        <Form.Item name="kind" rules={[{ required: true }]}><Select style={{ width: 130 }} placeholder="Loại" options={[
          { value: 'service', label: 'Dịch vụ' }, { value: 'part', label: 'Linh kiện' },
        ]} onChange={() => commitmentForm.setFieldValue('itemId', undefined)} /></Form.Item>
        <Form.Item noStyle shouldUpdate={(p, c) => p.kind !== c.kind}>{({ getFieldValue }) =>
          <Form.Item name="itemId" rules={[{ required: true }]}>
            <Select style={{ width: 240 }} placeholder="Hạng mục" options={getFieldValue('kind') === 'service'
              ? serviceLines.map((x) => ({ value: x.dichVuId, label: x.tenDichVu }))
              : exports.map((x) => ({ value: x.chiTietXuatKhoId, label: x.tenLinhKien || `Dòng #${x.chiTietXuatKhoId}` }))} />
          </Form.Item>}
        </Form.Item>
        <Form.Item name="dates" rules={[{ required: true }]}><DatePicker.RangePicker format="DD/MM/YYYY" /></Form.Item>
        <Form.Item name="dieuKien"><Input placeholder="Điều kiện" maxLength={1000} /></Form.Item>
        <Button htmlType="submit" disabled={selected?.trangThai !== 'DA_TRA'} loading={busy}>Tạo cam kết</Button>
      </Form>
      <Table size="small" style={{ marginTop: 12 }} dataSource={commitments} rowKey="id" pagination={false} columns={[
        { title: 'Loại', dataIndex: 'loai' }, { title: 'Bắt đầu', dataIndex: 'ngayBatDau' },
        { title: 'Hết hạn', dataIndex: 'ngayKetThuc' }, { title: 'Điều kiện', dataIndex: 'dieuKien' },
      ]} />
    </Card>
    <Card size="small" title="Tiếp nhận khách quay lại bảo hành">
      <Form form={claimForm} layout="inline" onFinish={(v) => perform(async () => {
        await api.taoBaoHanhKhachV3({ phieuGocId: selected.id, camKetId: v.camKetId || null,
          phieuSuaBaoHanhId: v.phieuSuaBaoHanhId || null, loiKhachBao: v.loiKhachBao });
        claimForm.resetFields();
      }, 'Đã tiếp nhận bảo hành.')} style={{ gap: 8 }}>
        <Form.Item name="camKetId"><Select allowClear style={{ width: 220 }} placeholder="Cam kết (nếu có)"
          options={commitments.map((x) => ({ value: x.id, label: `#${x.id} — ${x.loai}` }))} /></Form.Item>
        <Form.Item name="loiKhachBao" rules={[{ required: true }]}><Input style={{ width: 300 }} placeholder="Lỗi khách báo" maxLength={1000} /></Form.Item>
        <Form.Item name="phieuSuaBaoHanhId"><Select allowClear style={{ width: 220 }}
          placeholder="Phiếu sửa lại (nếu có)" options={warrantyRepairTicketOptions} /></Form.Item>
        <Button htmlType="submit" disabled={selected?.trangThai !== 'DA_TRA'} loading={busy}>Tiếp nhận</Button>
      </Form>
      <Table size="small" style={{ marginTop: 12 }} dataSource={claims} rowKey="id" pagination={{ pageSize: 5 }} columns={[
        { title: 'Mã', dataIndex: 'id', render: (v) => `#${v}` },
        { title: 'Lỗi khách báo', dataIndex: 'loiKhachBao' },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
        { title: 'Lần bảo hành', render: (_, row) => row.pheDuyetLap?.lanThu || '—' },
        { title: 'Phiếu sửa lại', render: (_, row) => row.phieuSuaBaoHanhId
          ? tickets.find((x) => x.id === row.phieuSuaBaoHanhId)?.maPhieu || `#${row.phieuSuaBaoHanhId}`
          : <Button size="small" onClick={() => { setLinkingClaim(row); linkClaimForm.resetFields(); }}>
            Liên kết phiếu sửa</Button> },
        { title: 'Nguyên nhân / chi phí', render: (_, row) => <Space>
          <Text>{row.phanTich ? `${row.phanTich.benChiuChiPhi} · ${money(row.phanTich.chiPhiThucTe)}` : 'Chưa ghi'}</Text>
          <Button size="small" onClick={() => {
            setAnalysisClaim(row);
            analysisForm.setFieldsValue(row.phanTich || { chiPhiDuKien: 0 });
          }}>Phân tích</Button>
        </Space> },
        { title: 'Duyệt lặp lại', render: (_, row) => <Space>
          <Tag color={row.pheDuyetLap?.trangThai === 'CHO_DUYET' ? 'orange'
            : row.pheDuyetLap?.trangThai === 'TU_CHOI' ? 'red' : 'green'}>
            {row.pheDuyetLap?.trangThai || '—'}
          </Tag>
          {user?.role === 'admin' && row.pheDuyetLap?.trangThai === 'CHO_DUYET' &&
            <Button size="small" onClick={() => { setApprovingClaim(row); approvalForm.resetFields(); }}>
              Xem và duyệt
            </Button>}
        </Space> },
      ]} />
      <Form form={statusForm} layout="inline" onFinish={(v) => perform(() =>
        api.doiTrangThaiBaoHanhKhachV3(v.claimId, { trangThai: v.trangThai,
          ketLuan: v.ketLuan || null, ketQuaXuLy: v.ketQuaXuLy || null }), 'Đã cập nhật bảo hành.')}
      style={{ gap: 8 }}>
        <Form.Item name="claimId" rules={[{ required: true }]}><Select style={{ width: 120 }} placeholder="Phiếu BH"
          options={claims.map((x) => ({ value: x.id, label: `#${x.id}` }))}
          onChange={() => statusForm.setFieldValue('trangThai', undefined)} /></Form.Item>
        <Form.Item noStyle shouldUpdate={(p, c) => p.claimId !== c.claimId}>{({ getFieldValue }) => {
          const claim = claims.find((x) => x.id === getFieldValue('claimId'));
          return <Form.Item name="trangThai" rules={[{ required: true }]}><Select style={{ width: 190 }} placeholder="Bước tiếp theo"
            options={(claim?.pheDuyetLap?.trangThai === 'CHO_DUYET'
              || claim?.pheDuyetLap?.trangThai === 'TU_CHOI' ? []
              : warrantyNext[claim?.trangThai] || []).map((x) => ({ value: x, label: x }))} /></Form.Item>;
        }}</Form.Item>
        <Form.Item name="ketLuan"><Input placeholder="Kết luận / lý do từ chối" maxLength={1000} /></Form.Item>
        <Form.Item name="ketQuaXuLy"><Input placeholder="Kết quả xử lý" maxLength={1000} /></Form.Item>
        <Button htmlType="submit" loading={busy}>Cập nhật</Button>
      </Form>
    </Card>
  </Space>;

  const intakeChecklist = parseChecklist(selected?.checklistTiepNhanJson);

  const operationsTab = <Space direction="vertical" style={{ width: '100%' }}>
    {selected?.apDungKiemSoatTiepNhan && <Card size="small" title="Tình trạng ghi nhận khi tiếp nhận">
      <Text><b>Serial/IMEI:</b> {selected.soSerialThietBi || 'Không có serial'}</Text><br />
      <Text><b>Lỗi khách báo:</b> {selected.tinhTrangLoi || '—'}</Text><br />
      <Text><b>Ngoại quan:</b> {selected.tinhTrangNgoaiQuan || '—'}</Text><br />
      <Text><b>Phụ kiện:</b> {selected.phuKienKemTheo === 'KHONG_CO'
        ? 'Không có' : selected.phuKienKemTheo || '—'}</Text><br />
      {selected.lyDoKhongSerial && <><Text><b>Lý do thiếu serial:</b> {selected.lyDoKhongSerial}</Text><br /></>}
      <Text><b>Checklist:</b> màn hình {intakeChecklist?.manHinh || '—'}, vỏ {intakeChecklist?.voMay || '—'},
        nguồn {intakeChecklist?.nguon || '—'}, tem/ốc {intakeChecklist?.temOc || '—'},
        dấu hiệu nước {intakeChecklist?.dauHieuNuoc || '—'}</Text>
    </Card>}
    <Card size="small" title="Bàn giao cho KTV và kết quả kiểm tra"
      extra={<Button size="small" onClick={() => { loadTickets(); loadDetail(selected.id); }}>Làm mới</Button>}>
      <Text>KTV phụ trách: {selected?.tenKyThuatVien || 'Chưa phân công'}</Text><br />
      <Text>Nhận máy: {selected?.ktvNhanLuc
        ? dayjs(selected.ktvNhanLuc).format('DD/MM/YYYY HH:mm') : 'Chưa xác nhận'}</Text><br />
      <Text>Kết quả kiểm tra: {selected?.ketQuaKiemTra || 'KTV chưa ghi nhận'}</Text>
    </Card>
    <Card size="small" title="Phân công kỹ thuật viên">
      <Form form={assignmentForm} layout="inline" style={{ gap: 8 }}
        onFinish={(v) => perform(() => api.phanCongPhieu(selected.id,
          { kyThuatVienId: v.kyThuatVienId ?? null }), 'Đã cập nhật kỹ thuật viên phụ trách.')}>
        <Form.Item name="kyThuatVienId"><Select allowClear style={{ width: 300 }}
          placeholder="Chọn kỹ thuật viên" options={technicians.map((x) => ({
            value: x.id, label: `${x.hoTen} · ${x.soCaDangLam} ca đang làm`,
          }))} /></Form.Item>
        <Button htmlType="submit" disabled={['HUY', 'DA_TRA', 'HOAN_THANH'].includes(selected?.trangThai)}
          loading={busy}>Lưu phân công</Button>
      </Form>
    </Card>
    <Card size="small" title="Thời gian hẹn trả">
      <Form form={returnDateForm} layout="inline" style={{ gap: 8 }}
        onFinish={(v) => perform(() => api.doiHenTraPhieu(selected.id,
          { ngayHenTra: v.ngayHenTra?.toISOString() || null }), 'Đã cập nhật giờ hẹn trả.')}>
        <Form.Item name="ngayHenTra"><DatePicker showTime format="DD/MM/YYYY HH:mm"
          style={{ width: 230 }} /></Form.Item>
        <Button htmlType="submit" disabled={['HUY', 'DA_TRA'].includes(selected?.trangThai)}
          loading={busy}>Lưu hẹn trả</Button>
      </Form>
    </Card>
    {selected?.apDungKiemSoatTiepNhan &&
      <IntakeConfirmationPanel key={selected?.id} ticketId={selected.id}
        ticketStatus={selected.trangThai}
        onConfirmed={() => { loadDetail(selected.id); loadTickets(); }} />}
    <TicketPhotos key={`${selected?.id}-${!!intakeConfirmation}`}
      ticketId={selected?.id} role={user?.role} ticketStatus={selected?.trangThai}
      intakeConfirmed={!!intakeConfirmation} />
    {['TIEP_NHAN', 'DANG_SUA', 'CHO_LINH_KIEN'].includes(selected?.trangThai) &&
      <Card size="small" title="Hủy phiếu">
        <Alert type="warning" showIcon style={{ marginBottom: 12 }}
          message="Cần hoàn tiền cọc và trả hết vật tư đã xuất trước khi hủy." />
        <Space wrap><Input style={{ width: 380 }} maxLength={500} value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)} placeholder="Lý do hủy phiếu" />
          <Popconfirm title="Xác nhận hủy phiếu sửa chữa?" onConfirm={() => perform(async () => {
            await api.capNhatTrangThaiPhieu(selected.id,
              { trangThai: 'HUY', lyDoHuy: cancelReason.trim() });
            setCancelReason('');
          }, 'Đã hủy phiếu.')}>
            <Button danger disabled={!cancelReason.trim()} loading={busy}>Hủy phiếu</Button>
          </Popconfirm></Space>
      </Card>}
  </Space>;

  return <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <div className="page-heading"><div><Title level={3} style={{ margin: 0 }}>Tiếp nhận & thu ngân</Title>
      <span>Phiếu sửa chữa, lịch hẹn và thanh toán</span></div></div>
    <Space wrap><Input.Search placeholder="Mã phiếu, khách, SĐT, thiết bị" allowClear style={{ width: 300 }}
      value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button onClick={loadTickets}>Làm mới</Button>
      <Button onClick={() => { setCodeOpen(true); setCustomerPhone('');
        setCustomerMatch(null); setLinkCode(null); }}>Cấp mã liên kết khách</Button>
      <Button type="primary" onClick={() => setIntakeOpen(true)}>Tiếp nhận máy</Button></Space>
    <Card size="small" title="Lịch hẹn mang máy đến" extra={<Button onClick={() => loadAppointments()}>Làm mới</Button>}>
      <Table dataSource={appointments} rowKey="id" size="small" pagination={{ pageSize: 5 }} scroll={{ x: 950 }} columns={[
        { title: 'Thời gian', dataIndex: 'thoiGianMongMuon', render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm') },
        { title: 'Khách', dataIndex: 'tenKhachHang' },
        { title: 'SĐT', dataIndex: 'soDienThoai' },
        { title: 'Thiết bị', dataIndex: 'tenThietBi' },
        { title: 'Lỗi báo', dataIndex: 'moTaLoi' },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
        { title: 'Phiếu sửa', dataIndex: 'phieuId', render: (v) => v ? `#${v}` : 'Chưa gắn' },
        { title: '', render: (_, row) => row.trangThai === 'CHO_XAC_NHAN'
          ? <Space>
            <Button size="small" type="primary" loading={busy}
              onClick={() => updateAppointment(row.id, { trangThai: 'DA_XAC_NHAN' })}>Xác nhận</Button>
            <Popconfirm title="Từ chối lịch hẹn?" onConfirm={() => updateAppointment(row.id,
              { trangThai: 'TU_CHOI', ghiChu: 'Không thể tiếp nhận vào thời gian đã chọn' })}>
              <Button size="small" danger>Từ chối</Button></Popconfirm>
          </Space>
          : row.trangThai === 'DA_XAC_NHAN'
            ? <Button size="small" onClick={() => { setLinkingAppointment(row); setLinkTicketId(null); }}>
              Gắn phiếu đã tiếp nhận</Button> : row.phieuId ? `Phiếu #${row.phieuId}` : null },
      ]} />
    </Card>
    <Table loading={loading} dataSource={tickets.filter((x) =>
      `${x.maPhieu} ${x.tenKhachHang} ${x.soDienThoaiKhach || ''} ${x.tenThietBi}`.toLowerCase().includes(search.toLowerCase()))}
      rowKey="id" scroll={{ x: 850 }} pagination={{ pageSize: 10 }} columns={[
        { title: 'Mã phiếu', dataIndex: 'maPhieu' },
        { title: 'Khách hàng', dataIndex: 'tenKhachHang' },
        { title: 'Thiết bị', dataIndex: 'tenThietBi' },
        { title: 'Ngày nhận', dataIndex: 'ngayNhan', render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm') },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
        { title: '', render: (_, row) => <Button onClick={() => openTicket(row)}>Xử lý</Button> },
      ]} />
    <Modal open={codeOpen} title="Cấp mã liên kết hồ sơ khách"
      onCancel={() => setCodeOpen(false)} footer={<Button onClick={() => setCodeOpen(false)}>Đóng</Button>}>
      <Alert type="info" showIcon style={{ marginBottom: 12 }}
        message="Chỉ cấp mã sau khi đã xác minh khách tại quầy" />
      <Space.Compact style={{ width: '100%' }}>
        <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
          onPressEnter={findCustomer} placeholder="Số điện thoại khách" />
        <Button onClick={findCustomer} loading={busy}>Tìm</Button>
      </Space.Compact>
      {customerMatch && <Space direction="vertical" style={{ marginTop: 12, width: '100%' }}>
        <Text>{customerMatch.hoTen} · {customerMatch.soDienThoai}</Text>
        {customerMatch.daCoTaiKhoan ? <Tag color="green">Đã có tài khoản</Tag>
          : <Button type="primary" onClick={issueLinkCode} loading={busy}>Cấp mã 15 phút</Button>}
      </Space>}
      {linkCode && <Alert style={{ marginTop: 12 }} type="success" showIcon
        message={<Text copyable>{linkCode.maLienKet}</Text>}
        description={`Hết hạn: ${dayjs(linkCode.hetHan).format('DD/MM/YYYY HH:mm')}. Chỉ đưa mã cho khách đã xác minh.`} />}
    </Modal>
    <Modal open={!!linkingClaim} title={`Liên kết phiếu sửa bảo hành #${linkingClaim?.id || ''}`}
      onCancel={() => setLinkingClaim(null)} footer={null} destroyOnHidden>
      <Form form={linkClaimForm} layout="vertical" onFinish={async (v) => {
        setBusy(true);
        try {
          await api.lienKetPhieuSuaBaoHanhV3(linkingClaim.id, v);
          message.success('Đã liên kết phiếu sửa với lần bảo hành.');
          setLinkingClaim(null);
          await loadDetail(selected.id);
        } catch (e) { message.error(errorText(e)); }
        finally { setBusy(false); }
      }}>
        <Form.Item name="phieuSuaBaoHanhId" label="Phiếu sửa cùng thiết bị" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label" options={tickets.filter((x) =>
            x.id !== linkingClaim?.phieuGocId && x.thietBiId === linkingClaim?.thietBiId
            && x.trangThai !== 'HUY').map((x) => ({ value: x.id, label: x.maPhieu }))} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Liên kết</Button>
      </Form>
    </Modal>
    <Modal open={!!analysisClaim} title={`Phân tích bảo hành #${analysisClaim?.id || ''}`}
      onCancel={() => setAnalysisClaim(null)} footer={null} destroyOnHidden>
      <Alert type="info" showIcon style={{ marginBottom: 12 }}
        message="Ghi nguyên nhân và bên chịu chi phí cho từng lần khách quay lại"
        description="Chi phí thực tế cần được ghi trước khi đánh dấu hoàn thành bảo hành." />
      <Form form={analysisForm} layout="vertical" onFinish={async (v) => {
        setBusy(true);
        try {
          await api.phanTichChiPhiBaoHanhV3(analysisClaim.id, {
            ...v, chiPhiThucTe: v.chiPhiThucTe ?? null,
          });
          message.success('Đã lưu phân tích bảo hành.');
          setAnalysisClaim(null);
          await loadDetail(selected.id);
        } catch (e) { message.error(errorText(e)); }
        finally { setBusy(false); }
      }}>
        <Form.Item name="nguyenNhan" label="Nguyên nhân" rules={[{ required: true, whitespace: true }]}>
          <Input.TextArea maxLength={1000} rows={3} /></Form.Item>
        <Form.Item name="benChiuChiPhi" label="Bên chịu chi phí" rules={[{ required: true }]}>
          <Select options={[{ value: 'CUA_HANG', label: 'Cửa hàng' },
            { value: 'KHACH', label: 'Khách hàng' }, { value: 'NCC', label: 'Nhà cung cấp' },
            { value: 'KTV', label: 'Kỹ thuật viên' }]} /></Form.Item>
        <Form.Item name="chiPhiDuKien" label="Chi phí dự kiến" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="chiPhiThucTe" label="Chi phí thực tế">
          <InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Lưu phân tích</Button>
      </Form>
    </Modal>
    <Modal open={!!linkingAppointment} title={`Gắn lịch #${linkingAppointment?.id || ''} với phiếu sửa`}
      onCancel={() => setLinkingAppointment(null)} okText="Gắn phiếu" confirmLoading={busy}
      okButtonProps={{ disabled: !linkTicketId }}
      onOk={() => updateAppointment(linkingAppointment.id,
        { trangThai: 'DA_TIEP_NHAN', phieuId: linkTicketId })}>
      <Text>Tiếp nhận máy trước, sau đó chọn phiếu của khách {linkingAppointment?.tenKhachHang}.</Text>
      <Select style={{ width: '100%', marginTop: 12 }} placeholder="Chọn phiếu cùng số điện thoại"
        value={linkTicketId} onChange={setLinkTicketId}
        options={tickets.filter((x) => x.soDienThoaiKhach === linkingAppointment?.soDienThoai)
          .map((x) => ({ value: x.id, label: `${x.maPhieu} — ${x.tenThietBi}` }))} />
    </Modal>
    <IntakeModal visible={intakeOpen} onCancel={() => setIntakeOpen(false)}
      onSubmitTicket={() => { loadTickets(); }} />
    <Modal open={!!approvingClaim} title={`Duyệt bảo hành lần ${approvingClaim?.pheDuyetLap?.lanThu || ''}`}
      onCancel={() => setApprovingClaim(null)} footer={null} destroyOnHidden>
      <Alert type="warning" showIcon style={{ marginBottom: 12 }}
        message={approvingClaim?.loiKhachBao} description="Ghi nguyên nhân sơ bộ và lý do quyết định trước khi xử lý tiếp." />
      <Form form={approvalForm} layout="vertical" onFinish={async (v) => {
        setBusy(true);
        try {
          await api.duyetBaoHanhLapV3(approvingClaim.id, v);
          message.success('Đã ghi quyết định bảo hành lặp lại.');
          setApprovingClaim(null);
          await loadDetail(selected.id);
        } catch (e) { message.error(errorText(e)); }
        finally { setBusy(false); }
      }}>
        <Form.Item name="quyetDinh" label="Quyết định" rules={[{ required: true }]}>
          <Select options={[{ value: 'DA_DUYET', label: 'Chấp thuận' },
            { value: 'TU_CHOI', label: 'Từ chối' }]} />
        </Form.Item>
        <Form.Item name="nguyenNhanSoBo" label="Nguyên nhân sơ bộ"
          rules={[{ required: true, whitespace: true }]}><Input.TextArea maxLength={1000} /></Form.Item>
        <Form.Item name="lyDoQuyetDinh" label="Lý do quyết định"
          rules={[{ required: true, whitespace: true }]}><Input.TextArea maxLength={1000} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Lưu quyết định</Button>
      </Form>
    </Modal>
    <Drawer open={!!selected} width="min(1100px, 100vw)" onClose={() => setSelected(null)}
      title={`${selected?.maPhieu || ''} — ${selected?.tenKhachHang || ''}`} destroyOnHidden>
      {selected && <Space direction="vertical" style={{ width: '100%' }}>
        <Text>Trạng thái: <Tag>{selected.trangThai}</Tag> · {selected.tenThietBi} · {selected.soDienThoaiKhach}</Text>
        <Tabs items={[
          { key: 'operations', label: 'Điều phối · ảnh · hủy phiếu', children: operationsTab },
          { key: 'work', label: 'Công việc sửa chữa', children: <WorkItemsPanel
            ticketId={selected.id} technicians={technicians} issued={exports} claims={claims} /> },
          { key: 'quote', label: 'Báo giá', children: quoteTab },
          { key: 'finance', label: 'Hóa đơn · thu tiền · bàn giao', children: financeTab },
          { key: 'warranty', label: 'Bảo hành khách', children: warrantyTab },
        ]} />
      </Space>}
    </Drawer>
  </Space>;
}
