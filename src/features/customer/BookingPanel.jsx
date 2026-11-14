import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, DatePicker, Form, Input, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { api } from '../../services/api';
import StatusTag from '../../components/StatusTag';

const { Text } = Typography;
const errorText = (error) => error.response?.data?.message || error.message || 'Thao tác thất bại.';
const vietnamTime = (value) => new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));
const vietnamDateTime = (value) => new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

export default function BookingPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';
  const [form] = Form.useForm();
  const [date, setDate] = useState(dayjs());
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [appointmentsError, setAppointmentsError] = useState('');
  const [busy, setBusy] = useState(false);
  const slotRequest = useRef(0);
  const dateKey = date.format('YYYY-MM-DD');

  const reloadSlots = useCallback(async () => {
    const request = ++slotRequest.current;
    setLoadingSlots(true);
    try {
      const result = await api.getKhungGioLichHen(dateKey);
      if (request === slotRequest.current) {
        setSlots(result.data?.khungGio || []);
        setSlotError('');
      }
    } catch {
      if (request === slotRequest.current) {
        setSlots([]);
        setSlotError('Không tải được khung giờ còn chỗ. Hãy thử lại.');
      }
    } finally { if (request === slotRequest.current) setLoadingSlots(false); }
  }, [dateKey]);

  const reloadAppointments = useCallback(async () => {
    if (!isCustomer) return;
    try { setAppointments((await api.getLichHenCuaToi()).data || []); setAppointmentsError(''); }
    catch { setAppointmentsError('Không tải được lịch hẹn của bạn. Hãy thử làm mới.'); }
  }, [isCustomer]);

  useEffect(() => { Promise.resolve().then(reloadSlots); }, [reloadSlots]);
  useEffect(() => { Promise.resolve().then(reloadAppointments); }, [reloadAppointments]);

  const book = async (values) => {
    setBusy(true);
    try {
      await api.datLichHen({
        thoiGianMongMuon: values.thoiGianMongMuon,
        tenThietBi: values.tenThietBi.trim(),
        moTaLoi: values.moTaLoi.trim(),
      });
      message.success('Đã gửi lịch hẹn để lễ tân xác nhận.');
      form.resetFields();
      await Promise.all([reloadSlots(), reloadAppointments()]);
    } catch (error) {
      message.error(errorText(error));
      await reloadSlots();
    } finally { setBusy(false); }
  };

  const cancel = async (id) => {
    setBusy(true);
    try {
      await api.huyLichHen(id);
      message.success('Đã hủy lịch hẹn.');
      await Promise.all([reloadSlots(), reloadAppointments()]);
    } catch (error) { message.error(errorText(error)); }
    finally { setBusy(false); }
  };

  return <Card title="Đặt lịch mang máy đến cửa hàng">
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Alert type="info" showIcon message="Khung giờ theo giờ Việt Nam"
        description="Mỗi khung giờ có số chỗ giới hạn. Lịch mới cần lễ tân xác nhận; nếu chỗ vừa hết, bạn hãy chọn giờ khác." />
      {!isCustomer ? user ? <Text>Tài khoản nhân viên không đặt lịch khách hàng tại đây.</Text>
        : <Space>
          <Text>Đăng nhập tài khoản khách hàng để đặt và quản lý lịch hẹn.</Text>
          <Button type="primary" onClick={() => navigate('/login', { state: { returnToBooking: true } })}>
            Đăng nhập / đăng ký
          </Button>
        </Space> : <>
        {slotError && <Alert type="warning" showIcon message={slotError}
          action={<Button size="small" onClick={reloadSlots}>Thử lại</Button>} />}
        <Form form={form} layout="vertical" onFinish={book} style={{ maxWidth: 600 }}>
          <Form.Item label="Ngày đến cửa hàng">
            <DatePicker value={date} format="DD/MM/YYYY" allowClear={false}
              disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
              onChange={(value) => { setDate(value); form.setFieldValue('thoiGianMongMuon', undefined); }} />
            <Button style={{ marginLeft: 8 }} onClick={reloadSlots} loading={loadingSlots}>Làm mới giờ</Button>
          </Form.Item>
          <Form.Item name="thoiGianMongMuon" label="Khung giờ còn chỗ" rules={[{ required: true, message: 'Chọn khung giờ.' }]}>
            <Select loading={loadingSlots} disabled={!!slotError} placeholder="Chọn giờ" options={slots.map((slot) => ({
              value: slot.thoiGian,
              label: `${vietnamTime(slot.thoiGian)} — còn ${slot.conCho} chỗ`,
              disabled: slot.conCho <= 0,
            }))} />
          </Form.Item>
          <Form.Item name="tenThietBi" label="Thiết bị" rules={[{ required: true }]}>
            <Input maxLength={150} placeholder="Ví dụ: Laptop Dell Inspiron" />
          </Form.Item>
          <Form.Item name="moTaLoi" label="Mô tả lỗi" rules={[{ required: true }]}>
            <Input.TextArea maxLength={1000} rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={busy} disabled={!!slotError}>Gửi lịch hẹn</Button>
        </Form>
        {appointmentsError && <Alert type="warning" showIcon message={appointmentsError}
          action={<Button size="small" onClick={reloadAppointments}>Thử lại</Button>} />}
        <Table size="small" title={() => 'Lịch hẹn của tôi'} rowKey="id"
          dataSource={appointments} pagination={{ pageSize: 5 }} columns={[
            { title: 'Thời gian', dataIndex: 'thoiGianMongMuon', render: vietnamDateTime },
            { title: 'Thiết bị', dataIndex: 'tenThietBi' },
            { title: 'Trạng thái', dataIndex: 'trangThai', render: (value) => <StatusTag value={value} /> },
            { title: 'Ghi chú lễ tân', dataIndex: 'ghiChu', render: (value) => value || '—' },
            { title: '', render: (_, row) => ['CHO_XAC_NHAN', 'DA_XAC_NHAN'].includes(row.trangThai)
              && new Date(row.thoiGianMongMuon) > new Date()
              ? <Popconfirm title="Hủy lịch hẹn này?" onConfirm={() => cancel(row.id)}>
                <Button size="small" danger loading={busy}>Hủy</Button>
              </Popconfirm> : null },
          ]} />
      </>}
    </Space>
  </Card>;
}
