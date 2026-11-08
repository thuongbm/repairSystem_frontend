import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Select, Space,
  Table, Tabs, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const { Text } = Typography;
const errorText = (e) => e.response?.data?.message || e.message || 'Thao tác thất bại.';
const serialList = (text = '') => text.split(/[\r\n,;\t]+/)
  .map((x) => x.trim().toUpperCase()).filter(Boolean);
const dateTime = (value) => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

export default function StockControlTab() {
  const { user } = useAuth();
  const [quarantineForm] = Form.useForm();
  const [proposalForm] = Form.useForm();
  const selectedPartId = Form.useWatch('linhKienId', quarantineForm);
  const policyCache = useRef({});
  const requestSeq = useRef(0);
  const [policies, setPolicies] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [stock, setStock] = useState([]);
  const [serials, setSerials] = useState([]);
  const [counts, setCounts] = useState([]);
  const [quarantines, setQuarantines] = useState([]);
  const [countOpen, setCountOpen] = useState(false);
  const [countLines, setCountLines] = useState([]);
  const [countNote, setCountNote] = useState('');
  const [countDetail, setCountDetail] = useState(null);
  const [quarantineOpen, setQuarantineOpen] = useState(false);
  const [decision, setDecision] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionValue, setDecisionValue] = useState(0);
  const [proposal, setProposal] = useState(null);
  const [documentCase, setDocumentCase] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState('ANH');
  const [documentFile, setDocumentFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api.getKho().then((res) => {
      if (!active) return;
      const rows = res.data || [];
      setWarehouses(rows);
      setWarehouseId(rows[0]?.id || null);
    }).catch((e) => message.error(errorText(e)));
    return () => { active = false; };
  }, []);

  const resolvePolicies = useCallback(async (rows) => {
    const missing = rows.filter((x) => !(x.linhKienId in policyCache.current));
    if (missing.length) {
      const results = await Promise.allSettled(missing.map((x) => api.getMauLinhKienV3(x.linhKienId)));
      results.forEach((result, index) => {
        policyCache.current[missing[index].linhKienId] = result.status === 'fulfilled'
          ? result.value.data?.theoDoiSerial ?? null : null;
      });
    }
    setPolicies({ ...policyCache.current });
  }, []);

  const load = useCallback(async () => {
    if (!warehouseId) return;
    const request = ++requestSeq.current;
    try {
      const [s, n, c, q] = await Promise.all([
        api.getTonKho({ khoId: warehouseId }),
        api.getLinhKienSerials({ khoId: warehouseId }),
        api.getKiemKeKhoV3({ khoId: warehouseId }),
        api.getCachLyVatTuV3({ khoId: warehouseId }),
      ]);
      if (request !== requestSeq.current) return;
      const rows = s.data || [];
      setStock(rows); setSerials(n.data || []);
      setCounts(c.data || []); setQuarantines(q.data || []);
      await resolvePolicies(rows);
    } catch (e) { message.error(errorText(e)); }
  }, [warehouseId, resolvePolicies]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const openCount = () => {
    if (!stock.length) { message.warning('Kho chưa có dòng tồn để kiểm kê.'); return; }
    setCountLines(stock.map((x) => ({ ...x, actual: null, serialText: '' })));
    setCountNote(''); setCountOpen(true);
  };

  const updateLine = (id, patch) => setCountLines((rows) => rows.map((x) =>
    x.linhKienId === id ? { ...x, ...patch } : x));

  const createCount = async () => {
    if (countLines.some((x) => !Number.isInteger(x.actual) || x.actual < 0)) {
      message.warning('Cần nhập số lượng thực tế của tất cả dòng, kể cả dòng tồn bằng 0.'); return;
    }
    for (const row of countLines) {
      const tracked = policies[row.linhKienId];
      const list = serialList(row.serialText);
      if (tracked == null) {
        message.warning(`${row.tenLinhKien} chưa có chính sách serial.`); return;
      }
      if (tracked && (list.length !== row.actual || new Set(list).size !== list.length)) {
        message.warning(`${row.tenLinhKien}: số serial thực tế phải đúng số lượng và không trùng.`); return;
      }
      if (!tracked && list.length) {
        message.warning(`${row.tenLinhKien} quản lý theo số lượng, không nhập serial.`); return;
      }
    }
    setBusy(true);
    try {
      await api.taoKiemKeKhoV3({ khoId: warehouseId, ghiChu: countNote.trim() || null,
        chiTiet: countLines.map((x) => ({ linhKienId: x.linhKienId,
          soLuongThucTe: x.actual,
          serialThucTe: policies[x.linhKienId] ? serialList(x.serialText) : [] })) });
      message.success('Đã gửi phiếu kiểm kê chờ quản lý duyệt.');
      setCountOpen(false); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const showCount = async (id) => {
    setBusy(true);
    try { setCountDetail((await api.getChiTietKiemKeKhoV3(id)).data); }
    catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const createQuarantine = async (values) => {
    const tracked = policies[values.linhKienId];
    if (tracked == null) { message.warning('Linh kiện chưa có chính sách serial.'); return; }
    setBusy(true);
    try {
      await api.taoCachLyVatTuV3({ khoId: warehouseId, linhKienId: values.linhKienId,
        linhKienSerialId: tracked ? values.linhKienSerialId : null,
        soLuong: tracked ? 1 : values.soLuong, lyDo: values.lyDo.trim() });
      message.success('Đã cách ly vật tư khỏi tồn có thể xuất.');
      setQuarantineOpen(false); quarantineForm.resetFields(); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const submitDecision = async () => {
    if (!decisionReason.trim()) { message.warning('Nhập lý do quyết định.'); return; }
    setBusy(true);
    try {
      if (decision.type === 'count') await api.duyetKiemKeKhoV3(decision.id,
        { quyetDinh: decision.verdict, lyDo: decisionReason.trim() });
      else if (decision.type === 'disposal-approve') await api.duyetXuLyVatTuV3(decision.id,
        { quyetDinh: decision.verdict, lyDo: decisionReason.trim(), giaTriDuyet: decisionValue ?? 0 });
      else await api.xuLyCachLyVatTuV3(decision.id,
        { quyetDinh: decision.verdict, lyDo: decisionReason.trim(), giaTriThuVe: decisionValue ?? 0 });
      message.success('Đã lưu quyết định.');
      setDecision(null); setCountDetail(null); setDecisionReason(''); setDecisionValue(0); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  const chooseDecision = (type, id, verdict) => {
    setDecision({ type, id, verdict }); setDecisionReason(''); setDecisionValue(0);
  };
  const submitProposal = async (values) => {
    setBusy(true);
    try {
      await api.deXuatXuLyVatTuV3(proposal.id, values);
      message.success('Đã gửi đề xuất xử lý chờ duyệt.');
      setProposal(null); proposalForm.resetFields(); await load();
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const openDocuments = async (caseFile) => {
    setDocumentCase(caseFile); setDocumentFile(null); setDocuments([]);
    try { setDocuments((await api.getTaiLieuThanhLyV3(caseFile.id)).data || []); }
    catch (e) { message.error(errorText(e)); }
  };
  const uploadDocument = async () => {
    if (!documentFile) { message.warning('Chọn tệp trước khi tải lên.'); return; }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('loai', documentType); form.append('file', documentFile);
      await api.taiTaiLieuThanhLyV3(documentCase.id, form);
      setDocuments((await api.getTaiLieuThanhLyV3(documentCase.id)).data || []);
      setDocumentFile(null);
      message.success('Đã tải chứng cứ.');
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };
  const viewDocument = async (doc) => {
    const preview = window.open('', '_blank');
    try {
      const blob = await api.getTaiLieuThanhLyFileV3(documentCase.id, doc.id);
      const url = URL.createObjectURL(blob);
      if (preview) preview.location.href = url;
      else {
        const link = document.createElement('a');
        link.href = url; link.download = doc.tenGoc; link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { if (preview) preview.close(); message.error(errorText(e)); }
  };
  const trackedQuarantinePart = policies[selectedPartId] === true;
  const availableSerials = serials.filter((x) => x.linhKienId === selectedPartId
    && x.trangThai === 'TRONG_KHO');
  const partName = (id) => stock.find((x) => x.linhKienId === id)?.tenLinhKien || `#${id}`;

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Alert type="info" showIcon
      message="Kiểm kê và cách ly vật tư có người lập, người duyệt riêng"
      description="Kiểm kê yêu cầu nhập đủ mọi dòng tồn của kho. Hàng lỗi được cách ly, kiểm tra, tải ảnh và biên bản; quản lý duyệt trước khi nhập lại, thanh lý hoặc tiêu hủy." />
    <Space wrap>
      <Select style={{ width: 240 }} value={warehouseId} onChange={(id) => {
        requestSeq.current += 1;
        setStock([]); setSerials([]); setCounts([]); setQuarantines([]);
        setCountOpen(false); setCountDetail(null); setQuarantineOpen(false);
        setWarehouseId(id);
      }}
        placeholder="Chọn kho" options={warehouses.map((x) => ({ value: x.id, label: x.tenKho }))} />
      <Button onClick={load} disabled={!warehouseId}>Làm mới</Button>
      <Button type="primary" disabled={!warehouseId || !stock.length} onClick={openCount}>Lập kiểm kê</Button>
      <Button disabled={!warehouseId || !stock.some((x) => x.soLuongTon > 0)}
        onClick={() => { quarantineForm.resetFields(); setQuarantineOpen(true); }}>Cách ly hàng lỗi</Button>
    </Space>
    <Tabs items={[
      { key: 'counts', label: `Kiểm kê (${counts.length})`, children: <Table size="small"
        dataSource={counts} rowKey="id" pagination={{ pageSize: 8 }} columns={[
          { title: 'Phiếu', dataIndex: 'id', render: (v) => `#${v}` },
          { title: 'Lập lúc', dataIndex: 'taoLuc', render: dateTime },
          { title: 'Người kiểm', dataIndex: 'nguoiKiemId', render: (v) => `#${v}` },
          { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
          { title: 'Ghi chú / lý do', render: (_, x) => x.lyDoQuyetDinh || x.ghiChu || '—' },
          { title: '', render: (_, x) => <Space>
            <Button size="small" onClick={() => showCount(x.id)}>Chi tiết</Button>
            {user?.role === 'admin' && x.trangThai === 'CHO_DUYET' && <>
              <Button size="small" type="primary" onClick={() => chooseDecision('count', x.id, 'DA_DUYET')}>Duyệt</Button>
              <Button size="small" danger onClick={() => chooseDecision('count', x.id, 'TU_CHOI')}>Từ chối</Button>
            </>}
          </Space> },
        ]} /> },
      { key: 'quarantine', label: `Cách ly (${quarantines.length})`, children: <Table size="small"
        dataSource={quarantines} rowKey="id" pagination={{ pageSize: 8 }} columns={[
          { title: 'Hồ sơ', dataIndex: 'id', render: (v) => `#${v}` },
          { title: 'Linh kiện', dataIndex: 'linhKienId', render: partName },
          { title: 'Serial', dataIndex: 'linhKienSerialId', render: (id) =>
            serials.find((s) => s.id === id)?.soSerial || (id ? `#${id}` : '—') },
          { title: 'SL', dataIndex: 'soLuong' },
          { title: 'Lý do cách ly', dataIndex: 'lyDo' },
          { title: 'Trạng thái', dataIndex: 'trangThai', render: (v) => <Tag>{v}</Tag> },
          { title: 'Hồ sơ xử lý', render: (_, x) => x.hoSo
            ? <><Tag>{x.hoSo.trangThai}</Tag><Text>{x.hoSo.huongXuLy} · {Number(x.hoSo.giaTriUocTinh).toLocaleString('vi-VN')} ₫</Text></>
            : 'Chưa đề xuất' },
          { title: 'Người lập', dataIndex: 'nguoiTaoId', render: (v) => `#${v}` },
          { title: '', render: (_, x) => <Space wrap>
            {x.trangThai === 'CACH_LY' && (!x.hoSo || x.hoSo.trangThai === 'TU_CHOI') &&
              <Button size="small" onClick={() => { setProposal(x); proposalForm.resetFields(); }}>
                Kiểm tra · đề xuất</Button>}
            {x.hoSo && <Button size="small" onClick={() => openDocuments(x.hoSo)}>Ảnh · biên bản</Button>}
            {user?.role === 'admin' && x.hoSo?.trangThai === 'CHO_DUYET' && <>
              <Button size="small" type="primary" onClick={() => chooseDecision('disposal-approve', x.hoSo.id, 'DA_DUYET')}>Duyệt</Button>
              <Button size="small" danger onClick={() => chooseDecision('disposal-approve', x.hoSo.id, 'TU_CHOI')}>Từ chối</Button>
            </>}
            {user?.role === 'admin' && x.hoSo?.trangThai === 'DA_DUYET' &&
              <Button size="small" type="primary" onClick={() => chooseDecision('quarantine', x.id, x.hoSo.huongXuLy)}>
                Thực hiện {x.hoSo.huongXuLy}</Button>}
          </Space> },
        ]} /> },
    ]} />

    <Modal title="Kiểm kê toàn bộ dòng tồn của kho" open={countOpen} width={1000}
      onCancel={() => setCountOpen(false)} onOk={createCount} confirmLoading={busy}
      okText="Gửi chờ duyệt" destroyOnHidden>
      <Alert type="warning" showIcon style={{ marginBottom: 12 }}
        message="Nhập số thực đếm cho từng dòng, kể cả dòng có tồn sổ bằng 0. Với linh kiện quản lý serial, quét hoặc dán toàn bộ serial tìm thấy." />
      <Table size="small" dataSource={countLines} rowKey="linhKienId" pagination={false}
        scroll={{ x: 850, y: 420 }} columns={[
          { title: 'Linh kiện', render: (_, x) => <><b>{x.maLk}</b><br />{x.tenLinhKien}</> },
          { title: 'Tồn sổ', dataIndex: 'soLuongTon', width: 90 },
          { title: 'Chính sách', width: 115, render: (_, x) => policies[x.linhKienId] == null
            ? <Tag color="red">Chưa rõ</Tag> : policies[x.linhKienId]
              ? <Tag>Serial</Tag> : <Tag>Số lượng</Tag> },
          { title: 'SL thực tế', width: 120, render: (_, x) => <InputNumber min={0}
            value={x.actual} onChange={(value) => updateLine(x.linhKienId, { actual: value })} /> },
          { title: 'Serial tìm thấy', width: 330, render: (_, x) => policies[x.linhKienId]
            ? <Input.TextArea rows={2} value={x.serialText}
                placeholder="Mỗi serial một dòng; có thể dùng dấu phẩy"
                onChange={(e) => updateLine(x.linhKienId, { serialText: e.target.value })} />
            : <Text type="secondary">Không áp dụng</Text> },
        ]} />
      <Input.TextArea style={{ marginTop: 12 }} maxLength={500} rows={2}
        value={countNote} onChange={(e) => setCountNote(e.target.value)} placeholder="Ghi chú kiểm kê" />
    </Modal>

    <Modal title={`Đề xuất xử lý vật tư cách ly #${proposal?.id || ''}`} open={!!proposal}
      onCancel={() => setProposal(null)} footer={null} destroyOnHidden>
      <Form form={proposalForm} layout="vertical" onFinish={submitProposal}>
        <Form.Item name="ketQuaKiemTra" label="Kết quả kiểm tra" rules={[{ required: true, whitespace: true }]}>
          <Input.TextArea rows={3} maxLength={1000} /></Form.Item>
        <Form.Item name="huongXuLy" label="Hướng xử lý" rules={[{ required: true }]}>
          <Select options={[{ value: 'NHAP_LAI', label: 'Nhập lại kho' },
            { value: 'THANH_LY', label: 'Thanh lý' },
            { value: 'TIEU_HUY', label: 'Tiêu hủy' }]} /></Form.Item>
        <Form.Item name="giaTriUocTinh" label="Giá trị ước tính" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Gửi đề xuất</Button>
      </Form>
    </Modal>

    <Modal title={`Ảnh và biên bản hồ sơ #${documentCase?.id || ''}`} open={!!documentCase}
      onCancel={() => setDocumentCase(null)} footer={null} destroyOnHidden>
      <Alert type="info" showIcon style={{ marginBottom: 12 }}
        message="Cần ít nhất một ảnh hiện trạng và một biên bản kiểm tra trước khi duyệt." />
      <Table size="small" dataSource={documents} rowKey="id" pagination={false} columns={[
        { title: 'Loại', dataIndex: 'loai' }, { title: 'Tệp', dataIndex: 'tenGoc' },
        { title: '', render: (_, x) => <Button size="small" onClick={() => viewDocument(x)}>Xem</Button> },
      ]} />
      {documentCase?.trangThai === 'CHO_DUYET' && <Space wrap style={{ marginTop: 12 }}>
        <Select value={documentType} onChange={setDocumentType} style={{ width: 140 }}
          options={[{ value: 'ANH', label: 'Ảnh' }, { value: 'BIEN_BAN', label: 'Biên bản' }]} />
        <input key={documents.length} type="file" accept={documentType === 'ANH' ? 'image/png,image/jpeg' : 'image/png,image/jpeg,application/pdf'}
          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
        <Button onClick={uploadDocument} loading={busy}>Tải lên</Button>
      </Space>}
    </Modal>

    <Modal title={`Chi tiết kiểm kê #${countDetail?.id || ''}`} open={!!countDetail}
      width={900} footer={null} onCancel={() => setCountDetail(null)} destroyOnHidden>
      <Text>Trạng thái: {countDetail?.trangThai} · Người kiểm #{countDetail?.nguoiKiemId}</Text>
      <Table style={{ marginTop: 12 }} size="small" dataSource={countDetail?.chiTiet || []}
        rowKey="linhKienId" pagination={false} columns={[
          { title: 'Linh kiện', dataIndex: 'linhKienId', render: partName },
          { title: 'Tồn sổ', dataIndex: 'soLuongSoSach' },
          { title: 'Thực tế', dataIndex: 'soLuongThucTe' },
          { title: 'Serial sổ', dataIndex: 'serialSoSachJson', render: (v) => v || '—' },
          { title: 'Serial thực tế', dataIndex: 'serialThucTeJson', render: (v) => v || '—' },
        ]} />
    </Modal>

    <Modal title="Cách ly vật tư lỗi" open={quarantineOpen} footer={null}
      onCancel={() => setQuarantineOpen(false)} destroyOnHidden>
      <Form form={quarantineForm} layout="vertical" onFinish={createQuarantine}
        initialValues={{ soLuong: 1 }}>
        <Form.Item name="linhKienId" label="Linh kiện trong kho" rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label" onChange={() => {
            quarantineForm.setFieldsValue({ linhKienSerialId: undefined, soLuong: 1 });
          }} options={stock.filter((x) => x.soLuongTon > 0).map((x) => ({
            value: x.linhKienId, label: `${x.maLk} · ${x.tenLinhKien} (còn ${x.soLuongTon})`,
          }))} />
        </Form.Item>
        {trackedQuarantinePart ? <Form.Item name="linhKienSerialId" label="Serial cần cách ly"
          rules={[{ required: true }]}>
          <Select showSearch optionFilterProp="label" options={availableSerials.map((x) => ({
            value: x.id, label: x.soSerial,
          }))} />
        </Form.Item> : <Form.Item name="soLuong" label="Số lượng" rules={[{ required: true }]}>
          <InputNumber min={1} max={stock.find((x) => x.linhKienId === selectedPartId)?.soLuongTon || 1}
            style={{ width: '100%' }} />
        </Form.Item>}
        <Form.Item name="lyDo" label="Lý do cách ly" rules={[{ required: true, whitespace: true }]}>
          <Input.TextArea maxLength={500} rows={3} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Cách ly</Button>
      </Form>
    </Modal>

    <Modal title={decision?.type === 'count' ? 'Quyết định kiểm kê'
      : decision?.type === 'disposal-approve' ? 'Duyệt hồ sơ xử lý' : 'Thực hiện xử lý vật tư'}
      open={!!decision} okText="Xác nhận" confirmLoading={busy}
      onCancel={() => setDecision(null)} onOk={submitDecision} destroyOnHidden>
      <Alert type="warning" showIcon style={{ marginBottom: 12 }}
        message={`Quyết định: ${decision?.verdict || ''}`}
        description="Người lập không được tự duyệt hồ sơ của mình." />
      <Input.TextArea maxLength={500} rows={3} value={decisionReason}
        onChange={(e) => setDecisionReason(e.target.value)} placeholder="Lý do quyết định (bắt buộc)" />
      {decision?.type === 'disposal-approve' && decision?.verdict === 'DA_DUYET' &&
        <InputNumber min={0} style={{ width: '100%', marginTop: 12 }}
          value={decisionValue} onChange={(v) => setDecisionValue(v)} placeholder="Giá trị được duyệt" />}
      {decision?.type === 'quarantine' && decision?.verdict === 'THANH_LY' &&
        <InputNumber min={0} style={{ width: '100%', marginTop: 12 }}
          value={decisionValue} onChange={(v) => setDecisionValue(v)} placeholder="Giá trị thu về" />}
    </Modal>
  </Space>;
}
