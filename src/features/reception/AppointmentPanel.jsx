import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Popconfirm, Select, Space, Table, message } from 'antd';
import { api } from '../../services/api';
import StatusTag from '../../components/StatusTag';

const errorText = (error) => error.response?.data?.message || error.message || 'Thao tác thất bại.';
const vietnamDateTime = (value) => new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

export default function AppointmentPanel({ tickets }) {
  const [rows, setRows] = useState([]);
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setRows((await api.getLichHen()).data || []); }
    catch (error) { message.error(errorText(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { Promise.resolve().then(reload); }, [reload]);

  const update = async (row, trangThai) => {
    const phieuId = trangThai === 'DA_TIEP_NHAN' ? links[row.id] : null;
    if (trangThai === 'DA_TIEP_NHAN' && !phieuId) {
      message.warning('Chọn phiếu sửa chữa của khách trước khi liên kết.');
      return;
    }
    setBusyId(row.id);
    try {
      await api.doiTrangThaiLichHen(row.id, { trangThai, phieuId, ghiChu: null });
      message.success('Đã cập nhật lịch hẹn.');
      await reload();
    } catch (error) { message.error(errorText(error)); }
    finally { setBusyId(null); }
  };

  return <Card title="Lịch hẹn mang máy đến" extra={<Button onClick={reload} loading={loading}>Làm mới</Button>}>
    <Table size="small" rowKey="id" dataSource={rows} loading={loading}
      scroll={{ x: 900 }} pagination={{ pageSize: 5 }} columns={[
        { title: 'Khách', render: (_, row) => <>{row.tenKhachHang}<br />{row.soDienThoai}</> },
        { title: 'Thời gian', dataIndex: 'thoiGianMongMuon', render: vietnamDateTime },
        { title: 'Thiết bị / lỗi', render: (_, row) => <>{row.tenThietBi}<br />{row.moTaLoi}</> },
        { title: 'Trạng thái', dataIndex: 'trangThai', render: (value) => <StatusTag value={value} /> },
        { title: 'Xử lý', render: (_, row) => row.trangThai === 'CHO_XAC_NHAN'
          ? <Space>
            <Button size="small" type="primary" loading={busyId === row.id}
              onClick={() => update(row, 'DA_XAC_NHAN')}>Xác nhận</Button>
            <Popconfirm title="Từ chối lịch này?" onConfirm={() => update(row, 'TU_CHOI')}>
              <Button size="small" danger loading={busyId === row.id}>Từ chối</Button>
            </Popconfirm>
          </Space>
          : row.trangThai === 'DA_XAC_NHAN'
            ? <Space>
              <Select style={{ width: 230 }} placeholder="Phiếu đã tiếp nhận" showSearch optionFilterProp="label"
                value={links[row.id]} onChange={(value) => setLinks((prev) => ({ ...prev, [row.id]: value }))}
                options={tickets.filter((ticket) => ticket.soDienThoaiKhach === row.soDienThoai)
                  .map((ticket) => ({ value: ticket.id, label: `${ticket.maPhieu} — ${ticket.tenThietBi}` }))} />
              <Button size="small" loading={busyId === row.id}
                onClick={() => update(row, 'DA_TIEP_NHAN')}>Liên kết phiếu</Button>
            </Space> : row.phieuId ? `Phiếu #${row.phieuId}` : null },
      ]} />
  </Card>;
}
