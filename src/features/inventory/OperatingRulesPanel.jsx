import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, message } from 'antd';
import { api } from '../../services/api';

const errorText = (e) => e.response?.data?.message || e.message || 'Không lưu được quy tắc.';

export default function OperatingRulesPanel() {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { form.setFieldsValue((await api.getQuyTacVanHanh()).data || {}); }
    catch (e) { message.error(errorText(e)); }
  }, [form]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const save = async (values) => {
    setBusy(true);
    try {
      const payload = { ...values,
        quyTacTraCong: values.quyTacTraCong.trim(),
        chinhSachSerial: values.chinhSachSerial.trim(),
      };
      form.setFieldsValue((await api.capNhatQuyTacVanHanh(payload)).data || {});
      message.success('Đã lưu quy tắc vận hành.');
    } catch (e) { message.error(errorText(e)); }
    finally { setBusy(false); }
  };

  return <Card title="Quy tắc vận hành">
    <Alert type="info" showIcon style={{ marginBottom: 16 }}
      message="Ngưỡng ảnh và bảo hành được hệ thống kiểm tra khi ghi nhận."
      description="Các trường kinh doanh, thuế và hóa đơn điện tử là thông tin cấu hình; hệ thống chưa tự tính thuế hoặc phát hành hóa đơn điện tử từ các trường này." />
    <Form form={form} layout="vertical" onFinish={save}>
      <Row gutter={16}>
        <Col xs={24} md={12}><Form.Item name="baoHanhLapDuyetTuLan"
          label="Bảo hành từ lần thứ mấy cần quản lý duyệt"
          rules={[{ required: true }]}>
          <InputNumber min={2} max={10} style={{ width: '100%' }} />
        </Form.Item></Col>
        <Col xs={24} md={12}><Form.Item name="anhTiepNhanToiThieu"
          label="Số ảnh đầu vào tối thiểu" rules={[{ required: true }]}>
          <InputNumber min={1} max={5} style={{ width: '100%' }} />
        </Form.Item></Col>
      </Row>
      <Form.Item name="quyTacTraCong" label="Quy tắc trả công thợ"
        rules={[{ required: true, whitespace: true }]}><Input.TextArea maxLength={500} rows={2} /></Form.Item>
      <Form.Item name="chinhSachSerial" label="Chính sách serial và đối soát"
        rules={[{ required: true, whitespace: true }]}><Input.TextArea maxLength={500} rows={2} /></Form.Item>
      <Row gutter={16}>
        <Col xs={24} md={8}><Form.Item name="loaiHinhKinhDoanh" label="Loại hình kinh doanh">
          <Input maxLength={100} /></Form.Item></Col>
        <Col xs={24} md={8}><Form.Item name="phuongPhapThue" label="Phương pháp thuế">
          <Input maxLength={100} /></Form.Item></Col>
        <Col xs={24} md={8}><Form.Item name="donViHoaDonDienTu" label="Đơn vị hóa đơn điện tử">
          <Input maxLength={150} /></Form.Item></Col>
      </Row>
      <Button type="primary" htmlType="submit" loading={busy}>Lưu quy tắc</Button>
    </Form>
  </Card>;
}
