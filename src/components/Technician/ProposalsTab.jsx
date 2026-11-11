import { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Input, 
  Select
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
            Đã duyệt
          </Tag>
        );
      case 'Khách từ chối':
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Từ chối
          </Tag>
        );
      case 'Chờ duyệt khách':
      default:
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Chờ duyệt
          </Tag>
        );
    }
  };

  const columns = [
    {
      title: 'Mã đề xuất',
      dataIndex: 'proposalCode',
      key: 'proposalCode',
      render: (text) => <Text strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{text}</Text>,
    },
    {
      title: 'Phiếu sửa chữa',
      key: 'job',
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ fontWeight: 600 }}>{record.repairJobCode}</Tag>
          <div style={{ fontSize: '12px', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>
            {record.device}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
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
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {record.reason}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            Tạo lúc: {record.updatedAt} • Phụ trách: {record.handler}
          </div>
        </div>
      ),
    },
    {
      title: 'Chi phí đề xuất (₫)',
      key: 'cost',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
            {record.totalCost.toLocaleString('vi-VN')} ₫
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Linh kiện: {record.partCost.toLocaleString('vi-VN')} ₫
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Công thợ: {record.laborCost.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getProposalStatusTag(status),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo mã đề xuất, mã phiếu, máy..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280, borderRadius: '6px' }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Chờ duyệt khách', label: 'Chờ duyệt khách' },
              { value: 'Khách đã duyệt', label: 'Khách đã duyệt' },
              { value: 'Khách từ chối', label: 'Khách từ chối' },
            ]}
          />
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ borderRadius: '6px' }}
          onClick={onOpenCreateProposal}
        >
          Tạo đề xuất mới
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