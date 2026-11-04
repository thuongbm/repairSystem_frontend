import { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Card, 
  Alert, 
  message, 
  Row, 
  Col
} from 'antd';
import { 
  DollarOutlined, 
  SendOutlined,
  ExclamationCircleOutlined 
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
      message.success(`Đã gửi đề xuất báo giá phát sinh cho ca máy ${job.code} sang Lễ tân!`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarOutlined style={{ color: '#faad14', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>
              Đề xuất báo giá phát sinh — Ca máy {job.code}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 'normal' }}>
              Thiết bị: {job.device} | Khách: {job.customer} ({job.phone})
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={720}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy bỏ
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          icon={<SendOutlined />} 
          style={{ background: '#faad14', borderColor: '#faad14' }}
          onClick={handleSubmit}
        >
          Gửi đề xuất sang Lễ tân / Quản lý duyệt khách
        </Button>,
      ]}
    >
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message="Lưu ý quy trình can thiệp phần cứng phát sinh"
        description="Khi phát hiện lỗi ẩn hoặc linh kiện cần thay thế ngoài cam kết ban đầu, KTV KHÔNG tự ý thay thế tính tiền mà phải gửi đề xuất này để Lễ tân liên hệ giải thích và nhận sự đồng thuận từ khách hàng."
        style={{ marginBottom: '16px' }}
      />

      <Card size="small" style={{ background: '#fafafa', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px' }}>
          <span style={{ fontWeight: 600 }}>Lỗi ban đầu khách khai báo: </span>
          <span style={{ color: '#595959' }}>{job.customerIssue}</span>
        </div>
        {job.actualDiagnosis && (
          <div style={{ fontSize: '13px', marginTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>Lỗi thực tế đã chẩn đoán: </span>
            <span style={{ color: '#cf1322' }}>{job.actualDiagnosis.notes || 'Chưa ghi chú'}</span>
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
          label={<span style={{ fontWeight: 600 }}>Tên hạng mục sửa chữa / Linh kiện phát sinh</span>}
          rules={[{ required: true, message: 'Vui lòng nhập tên hạng mục phát sinh!' }]}
        >
          <Input placeholder="VD: Thay IC nguồn sạc ISL95522 + Vệ sinh bôi keo tản nhiệt gốm" />
        </Form.Item>

        <Form.Item
          name="reason"
          label={<span style={{ fontWeight: 600 }}>Lý do kỹ thuật & Hiện trạng phần cứng</span>}
          rules={[{ required: true, message: 'Vui lòng giải trình rõ lý do phát sinh để lễ tân giải thích cho khách!' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Giải thích rõ vì sao phát sinh lỗi này: VD Tháo máy phát hiện tụ chập cháy lan sang IC nguồn phụ, chân tiếp xúc pin bị mủn do vào nước trước đó..." 
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label={<span style={{ fontWeight: 600 }}>Mức độ cần thiết</span>}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'Bắt buộc', label: '🔴 Bắt buộc (Không làm máy không thể hoạt động)' },
                  { value: 'Khuyến nghị', label: '🟡 Khuyến nghị (Nên làm để máy chạy bền, tránh hỏng lại)' },
                  { value: 'Tùy chọn', label: '🟢 Tùy chọn (Nâng cấp thêm theo nguyện vọng)' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="repairJobCodeDisplay"
              label={<span style={{ fontWeight: 600 }}>Mã phiếu sửa chữa gắn kết</span>}
            >
              <Input value={job.code} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="partCost"
              label={<span style={{ fontWeight: 600 }}>Tiền linh kiện phát sinh (₫)</span>}
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
              label={<span style={{ fontWeight: 600 }}>Tiền công thợ thực hiện (₫)</span>}
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

        {/* Tổng tiền dự kiến */}
        <Card 
          size="small" 
          style={{ 
            background: '#fffbe6', 
            border: '1px solid #ffe58f', 
            borderRadius: '8px', 
            marginTop: '8px' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#d46b08' }}>Tổng chi phí phát sinh đề xuất:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#cf1322' }}>
              {totalCost.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
            (Gồm: Linh kiện {((partCost || 0)).toLocaleString('vi-VN')} ₫ + Tiền công {((laborCost || 0)).toLocaleString('vi-VN')} ₫)
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default AdditionalProposalModal;
