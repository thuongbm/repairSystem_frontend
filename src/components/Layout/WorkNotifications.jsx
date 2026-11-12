import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Popover, Spin } from 'antd';
import { BellOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function WorkNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const requestId = useRef(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const role = user?.role;

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    const requests = [];
    if (['admin', 'receptionist', 'technician'].includes(role)) {
      requests.push({ kind: 'tickets', promise: api.getPhieuSuaChua({
        trangThai: role === 'technician' ? 'TIEP_NHAN,CHO_LINH_KIEN' : 'HOAN_THANH',
      }) });
    }
    if (['admin', 'receptionist'].includes(role)) {
      requests.push({ kind: 'appointments', promise: api.getLichHen({ trangThai: 'CHO_XAC_NHAN' }) });
    }
    if (['admin', 'warehouse'].includes(role)) {
      requests.push({ kind: 'stock', promise: api.getCanhBaoTonKho() });
    }
    const responses = await Promise.allSettled(requests.map((request) => request.promise));
    if (currentRequest !== requestId.current) return;
    const nextItems = [];
    responses.forEach((response, index) => {
      if (response.status !== 'fulfilled') return;
      const rows = Array.isArray(response.value?.data) ? response.value.data : [];
      if (requests[index].kind === 'tickets') rows.forEach((row) => {
        if (role === 'technician' && row.trangThai === 'TIEP_NHAN' && row.ktvNhanLuc) return;
        nextItems.push({ key: `ticket-${row.id}`, title: role === 'technician'
          ? (row.trangThai === 'CHO_LINH_KIEN' ? 'Phiếu chờ linh kiện' : 'Phiếu chờ nhận máy')
          : 'Phiếu sẵn sàng bàn giao', detail: `${row.maPhieu} · ${row.tenThietBi || 'Thiết bị'}`,
        path: `/${role === 'technician' ? 'technician' : 'reception'}?ticket=${row.id}` });
      });
      if (requests[index].kind === 'appointments') rows.forEach((row) => nextItems.push({
        key: `appointment-${row.id}`, title: 'Lịch hẹn chờ xác nhận',
        detail: `${row.tenKhachHang || 'Khách hàng'} · ${row.tenThietBi || 'Thiết bị'}`,
        path: '/reception',
      }));
      if (requests[index].kind === 'stock') rows.forEach((row) => nextItems.push({
        key: `stock-${row.khoId}-${row.linhKienId}`, title: row.mucDo === 'HET_HANG' ? 'Linh kiện đã hết' : 'Linh kiện sắp hết',
        detail: `${row.tenLinhKien} · ${row.tenKho}`, path: '/warehouse?tab=alerts',
      }));
    });
    setItems(nextItems);
    setError(responses.some((response) => response.status === 'rejected')
      ? 'Một số thông báo chưa tải được. Hãy thử làm mới.' : '');
    setLoading(false);
  }, [role]);

  useEffect(() => {
    const firstLoad = window.setTimeout(load, 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      requestId.current += 1;
      window.clearTimeout(firstLoad);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const content = <div className="header-popover-content">
    <div className="header-popover-heading">
      <div><strong>Thông báo công việc</strong><span>{items.length} việc cần theo dõi</span></div>
      <Button type="text" size="small" aria-label="Làm mới thông báo"
        icon={<ReloadOutlined />} loading={loading} onClick={load} />
    </div>
    {error && <div className="header-popover-state header-popover-error">{error}</div>}
    {loading && !items.length ? <div className="header-popover-state"><Spin size="small" /> Đang tải...</div>
      : items.length ? <div className="header-result-list">{items.slice(0, 8).map((item) =>
        <button type="button" className="header-result" key={item.key}
          onClick={() => { setOpen(false); navigate(item.path); }}>
          <span className="header-result-main">{item.title}</span>
          <span className="header-result-detail">{item.detail}</span>
        </button>)}</div>
        : !error && <div className="header-popover-state">Không có việc cần xử lý.</div>}
    {items.length > 8 && <div className="header-popover-hint">Hiển thị 8 trong {items.length} việc.</div>}
  </div>;

  return <Popover content={content} trigger="click" placement="bottomRight"
    open={open} onOpenChange={(next) => { setOpen(next); if (next) load(); }}>
    <Badge count={items.length} size="small" overflowCount={99}>
      <Button type="text" className="header-icon-button" aria-label={`Thông báo công việc: ${items.length} việc`}
        icon={<BellOutlined />} />
    </Badge>
  </Popover>;
}
