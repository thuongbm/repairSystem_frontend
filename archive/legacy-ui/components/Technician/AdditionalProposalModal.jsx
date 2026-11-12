import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  message,
  Row,
  Col
} from 'antd';
import {
  DollarOutlined,
  SendOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

const AdditionalProposalModal = ({ visible, job, onCancel, onSubmitProposal }) => {
  const [form] = Form.useForm();
  const [partCost, setPartCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);

  if (!job) return null;

  const totalCost = (partCost || 0) + (laborCost || 0);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newProposal = {
        proposalCode: `DX-${Math.floor(1000 + Math.random() * 9000)}`,
        repairJobCode: job.code,
        device: job.device,
        customer: `${job.customer} (${job.phone})`,
        title: values.title,
        reason: values.reason,
        partCost: values.partCost || 0,
        laborCost: values.laborCost || 0,
        totalCost: (values.partCost || 0) + (values.laborCost || 0),
        priority: values.priority || 'Khuyến nghị',
        status: 'Chờ duyệt khách',
        updatedAt: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        handler: 'Lễ tân điều phối',
      };

      onSubmitProposal(job.key, newProposal);
      message.success(`Đã gửi đề xuất báo giá cho ca máy ${job.code}`);
      form.resetFields();
      setPartCost(0);
      setLaborCost(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            <DollarOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
              Đề xuất báo giá phát sinh — {job.code}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>
              {job.device} • {job.customer} ({job.phone})
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={680}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
        >
          Gửi đề xuất phê duyệt
        </Button>,
      ]}
    >
      <Card size="small" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginBottom: '16px', borderRadius: '8px' }}>
        <div style={{ fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: '#334155' }}>Lỗi ban đầu: </span>
          <span style={{ color: '#64748b' }}>{job.customerIssue}</span>
        </div>
        {job.actualDiagnosis && (
          <div style={{ fontSize: '13px', marginTop: '6px' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Chẩn đoán thực tế: </span>
            <span style={{ color: '#0f172a' }}>{job.actualDiagnosis.notes || 'Chưa ghi chú'}</span>
          </div>
        )}
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'Bắt buộc',
          partCost: 0,
          laborCost: 150000,
        }}
      >
        <Form.Item
          name="title"
          label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Hạng mục / Linh kiện phát sinh</span>}
          rules={[{ required: true, message: 'Vui lòng nhập tên hạng mục' }]}
        >
          <Input placeholder="VD: Thay IC nguồn sạc ISL95522 + Vệ sinh tản nhiệt" />
        </Form.Item>

        <Form.Item
          name="reason"
          label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Lý do kỹ thuật & Hiện trạng</span>}
          rules={[{ required: true, message: 'Vui lòng nhập lý do phát sinh' }]}
        >
          <TextArea
            rows={3}
            placeholder="Giải trình nguyên nhân kỹ thuật phát sinh linh kiện..."
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Mức độ ưu tiên</span>}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'Bắt buộc', label: 'Bắt buộc (Cần thiết vận hành)' },
                  { value: 'Khuyến nghị', label: 'Khuyến nghị (Tránh tái hỏng)' },
                  { value: 'Tùy chọn', label: 'Tùy chọn (Nâng cấp thêm)' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="repairJobCodeDisplay"
              label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Mã phiếu sửa chữa</span>}
            >
              <Input value={job.code} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="partCost"
              label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Chi phí linh kiện (₫)</span>}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                min={0}
                step={50000}
                onChange={(val) => setPartCost(val || 0)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="laborCost"
              label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Công thợ (₫)</span>}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                min={0}
                step={50000}
                onChange={(val) => setLaborCost(val || 0)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Card
          size="small"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginTop: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, color: '#475569', fontSize: '13px' }}>Tổng chi phí đề xuất:</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {totalCost.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Linh kiện: {((partCost || 0)).toLocaleString('vi-VN')} ₫ + Công thợ: {((laborCost || 0)).toLocaleString('vi-VN')} ₫
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default AdditionalProposalModal;