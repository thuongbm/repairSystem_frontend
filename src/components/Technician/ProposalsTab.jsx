import { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Input, 
  Select, 
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  SearchOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const ProposalsTab = ({ proposals, onOpenCreateProposal }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredProposals = proposals.filter((p) => {
    const query = searchText.toLowerCase();
    const matchSearch =
      p.proposalCode.toLowerCase().includes(query) ||
      p.repairJobCode.toLowerCase().includes(query) ||
      p.device.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query);

    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const getProposalStatusTag = (status) => {
    switch (status) {
      case 'Khách đã duyệt':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Khách đã duyệt đồng ý
          </Tag>
        );
      case 'Khách từ chối':
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Khách từ chối
          </Tag>
        );
      case 'Chờ duyệt khách':
      default:
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Chờ lễ tân liên hệ khách duyệt
          </Tag>
        );
    }
  };

  const columns = [
    {
      title: 'Mã đề xuất',
      dataIndex: 'proposalCode',
      key: 'proposalCode',
      render: (text) => <Text strong style={{ fontFamily: 'monospace', color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: 'Mã phiếu sửa chữa',
      key: 'job',
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ fontWeight: 'bold' }}>{record.repairJobCode}</Tag>
          <div style={{ fontSize: '12px', color: '#1f2937', marginTop: '2px', fontWeight: 500 }}>
            {record.device}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {record.customer}
          </div>
        </div>
      ),
    },
    {
      title: 'Hạng mục & Lý do phát sinh',
      key: 'titleReason',
      render: (_, record) => (
        <div style={{ maxWidth: 350 }}>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#595959', marginTop: '4px', fontStyle: 'italic' }}>
            "{record.reason}"
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px' }}>
            Thời gian tạo: {record.updatedAt} • Phụ trách: {record.handler}
          </div>
        </div>
      ),
    },
    {
      title: 'Chi phí đề xuất (₫)',
      key: 'cost',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#cf1322' }}>
            {record.totalCost.toLocaleString('vi-VN')} ₫
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            Linh kiện: {record.partCost.toLocaleString('vi-VN')} ₫
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            Công thợ: {record.laborCost.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái phê duyệt',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getProposalStatusTag(status),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '12px' }}>
      <Alert
        type="info"
        showIcon
        message="Minh bạch chi phí sửa chữa đối với khách hàng"
        description="Mọi hạng mục phát sinh ngoài dự kiến ban đầu khi KTV can thiệp bo mạch đều được ghi nhận tại đây. Hệ thống tự động đẩy thông báo cho Lễ tân gọi giải thích chuyên môn cho khách, đảm bảo khách đồng ý bằng văn bản/ghi âm trước khi thợ tiến hành thay thế."
        style={{ marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo mã đề xuất, mã phiếu, máy..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280, borderRadius: '6px' }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 220 }}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái duyệt' },
              { value: 'Chờ duyệt khách', label: '🟡 Chờ duyệt khách' },
              { value: 'Khách đã duyệt', label: '🟢 Khách đã duyệt' },
              { value: 'Khách từ chối', label: '🔴 Khách từ chối' },
            ]}
          />
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ borderRadius: '6px', background: '#faad14', borderColor: '#faad14' }}
          onClick={onOpenCreateProposal}
        >
          Tạo đề xuất phát sinh mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProposals}
        rowKey="proposalCode"
        pagination={{ pageSize: 6 }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default ProposalsTab;
