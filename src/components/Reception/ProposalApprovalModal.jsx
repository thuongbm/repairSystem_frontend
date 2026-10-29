import { useState } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Input,
  Typography,
  message
} from 'antd';
import {
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const ProposalApprovalModal = ({ visible, proposal, onCancel, onResolveProposal }) => {
  const [callNotes, setCallNotes] = useState('');

  if (!proposal) return null;

  const handleApprove = () => {
    onResolveProposal(proposal.id, 'APPROVED', callNotes);
    message.success(`Đã ghi nhận khách duyệt đồng ý cho đề xuất ${proposal.proposalCode}!`);
  };

  const handleReject = () => {
    onResolveProposal(proposal.id, 'REJECTED', callNotes);
    message.warning(`Đã ghi nhận khách từ chối phát sinh cho đề xuất ${proposal.proposalCode}.`);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PhoneOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>
              Gọi điện xin ý kiến khách hàng về lỗi phát sinh — {proposal.proposalCode}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 'normal' }}>
              Mã ca máy: {proposal.ticketCode} | Kỹ thuật viên phát hiện: {proposal.technician}
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={720}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Đóng (Chưa liên hệ được)
        </Button>,
        <Button
          key="reject"
          danger
          icon={<CloseCircleOutlined />}
          onClick={handleReject}
        >
          Khách từ chối (Dừng sửa mục này)
        </Button>,
        <Button
          key="approve"
          type="primary"
          icon={<CheckCircleOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          onClick={handleApprove}
        >
          Khách đồng ý sửa (Tiếp tục xử lý)
        </Button>,
      ]}
    >
      <Card size="small" style={{ background: '#fffbe6', borderColor: '#ffe58f', marginBottom: '16px' }}>
        <Row gutter={[16, 8]}>
          <Col span={14}>
            <div><Text type="secondary">Khách hàng:</Text> <Text strong style={{ fontSize: '15px' }}>{proposal.customer}</Text></div>
            <div>
              <Text type="secondary">Số điện thoại:</Text>{' '}
              <a href={`tel:${proposal.phone}`} style={{ fontSize: '16px', fontWeight: 'bold' }}>
                <PhoneOutlined /> {proposal.phone}
              </a>
            </div>
            <div><Text type="secondary">Thiết bị:</Text> <Text strong>{proposal.device}</Text></div>
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <div><Text type="secondary">Thời gian phát hiện:</Text> <div>{proposal.createdAt}</div></div>
            <Tag color="red" style={{ marginTop: '4px' }}>⚡ {proposal.priority}</Tag>
          </Col>
        </Row>
      </Card>

      <Card size="small" title="Nội dung phát sinh thợ kỹ thuật yêu cầu" style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1f2937', marginBottom: '6px' }}>
          {proposal.proposalTitle}
        </div>
        <div style={{ background: '#f5f5f5', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', fontStyle: 'italic', color: '#595959', marginBottom: '12px' }}>
          "{proposal.technicalReason}"
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tiền linh kiện thay thế:</div>
            <div style={{ fontWeight: 600 }}>{proposal.partCost.toLocaleString('vi-VN')} ₫</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tiền công thợ thực hiện:</div>
            <div style={{ fontWeight: 600 }}>{proposal.laborCost.toLocaleString('vi-VN')} ₫</div>
          </Col>
          <Col span={8}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tổng chi phí phát sinh:</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#cf1322' }}>
              {proposal.totalCost.toLocaleString('vi-VN')} ₫
            </div>
          </Col>
        </Row>
      </Card>

      <div>
        <div style={{ marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>
          Ghi chú kết quả cuộc gọi của Lễ tân:
        </div>
        <TextArea
          rows={3}
          placeholder="VD: Đã gọi khách lúc 11:30, giải thích rõ nếu không thay thermal pad máy sẽ nóng sập. Khách đã đồng ý chi phí 500k và hẹn 18h qua lấy máy."
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default ProposalApprovalModal;
