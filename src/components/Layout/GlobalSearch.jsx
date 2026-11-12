import { useRef, useState } from 'react';
import { Empty, Input, Popover, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function GlobalSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const requestId = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const isWarehouse = user?.role === 'warehouse';

  const search = async (value) => {
    const term = value.trim();
    if (!term) {
      setOpen(false);
      setSearched(false);
      return;
    }
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');
    setSearched(true);
    setOpen(true);
    try {
      const response = isWarehouse
        ? await api.getTonKho({ keyword: term })
        : await api.getPhieuSuaChua({ search: term });
      if (currentRequest === requestId.current) {
        setResults(Array.isArray(response?.data) ? response.data.slice(0, 8) : []);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setResults([]);
        setError(err.response?.data?.message || 'Không tìm kiếm được. Vui lòng thử lại.');
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  const changeQuery = (event) => {
    requestId.current += 1;
    setQuery(event.target.value);
    setResults([]);
    setSearched(false);
    setLoading(false);
    setError('');
    setOpen(false);
  };

  const selectResult = (row) => {
    setOpen(false);
    if (isWarehouse) {
      navigate(`/warehouse?tab=inventory&search=${encodeURIComponent(row.maLk)}`);
    } else {
      const section = user?.role === 'technician' ? 'technician' : 'reception';
      navigate(`/${section}?ticket=${row.id}`);
    }
  };

  const content = <div className="header-popover-content">
    <div className="header-popover-title">{isWarehouse ? 'Linh kiện trong kho' : 'Phiếu sửa chữa'}</div>
    {loading ? <div className="header-popover-state"><Spin size="small" /> Đang tìm...</div>
      : error ? <div className="header-popover-state header-popover-error">{error}</div>
        : results.length ? <div className="header-result-list">{results.map((row) =>
          <button className="header-result" type="button"
            key={isWarehouse ? `${row.khoId}-${row.linhKienId}` : row.id}
            onClick={() => selectResult(row)}>
            <span className="header-result-main">{isWarehouse ? row.tenLinhKien : row.maPhieu}</span>
            <span className="header-result-detail">{isWarehouse
              ? `${row.maLk} · ${row.tenKho} · Tồn ${row.soLuongTon}`
              : `${row.tenThietBi || 'Thiết bị'} · ${row.trangThai || 'Chưa rõ trạng thái'}`}</span>
          </button>)}</div>
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy kết quả" />}
    {results.length === 8 && <div className="header-popover-hint">Hiển thị 8 kết quả đầu tiên. Hãy nhập từ khóa cụ thể hơn.</div>}
  </div>;

  return <Popover content={content} trigger="click" placement="bottomRight"
    open={open} onOpenChange={(next) => setOpen(next && searched)}>
    <Input.Search
      aria-label={isWarehouse ? 'Tìm linh kiện trong kho' : 'Tìm phiếu sửa chữa'}
      className="header-search-input"
      placeholder={isWarehouse ? 'Tìm mã hoặc tên linh kiện' : 'Tìm mã phiếu, thiết bị, SĐT'}
      value={query}
      onChange={changeQuery}
      onSearch={search}
      loading={loading}
      allowClear
    />
  </Popover>;
}
