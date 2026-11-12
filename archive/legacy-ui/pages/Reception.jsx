import { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Input,
  Button,
  Tag,
  Space,
  Tabs,
  Badge,
  Row,
  Col,
  Select,
  Tooltip,
  message,
  Modal
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DollarOutlined,
  PhoneOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  EyeOutlined
} from '@ant-design/icons';

import IntakeModal from '../components/Reception/IntakeModal';
import PaymentCheckoutModal from '../components/Reception/PaymentCheckoutModal';
import ProposalApprovalModal from '../components/Reception/ProposalApprovalModal';
import ShiftSummaryTab from '../components/Reception/ShiftSummaryTab';

import {
  initialTickets,
  initialPendingProposals,
  initialCashRegister,
  RECEPTIONIST_INFO
} from '../components/Reception/mockReceptionData';

const { Text } = Typography;

const getStatusTag = (status) => {
  switch (status) {
    case 'Mới tiếp nhận':
      return <Tag style={{ borderRadius: '4px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>Mới tiếp nhận</Tag>;
    case 'Đang kiểm tra':
      return <Tag color="cyan" style={{ borderRadius: '4px' }}>Đang kiểm tra</Tag>;
    case 'Đang sửa':
    case 'Đang sửa chữa':
      return <Tag color="blue" style={{ borderRadius: '4px' }}>Đang sửa</Tag>;
    case 'Chờ linh kiện':
      return <Tag color="warning" style={{ borderRadius: '4px' }}>Chờ linh kiện</Tag>;
    case 'Chờ duyệt phát sinh':
      return <Tag color="volcano" style={{ borderRadius: '4px' }}>Chờ duyệt khách</Tag>;
    case 'Hoàn thành':
      return <Tag color="success" style={{ borderRadius: '4px' }}>Sẵn sàng trả</Tag>;
    case 'Đã trả máy':
      return <Tag style={{ borderRadius: '4px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>Đã bàn giao</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const Reception = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState(initialTickets);
  const [pendingProposals, setPendingProposals] = useState(initialPendingProposals);
  const [cashRegister, setCashRegister] = useState(initialCashRegister);

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [selectedTicketForAction, setSelectedTicketForAction] = useState(null);
  const [selectedProposalForAction, setSelectedProposalForAction] = useState(null);
  const [detailModalTicket, setDetailModalTicket] = useState(null);

  // KPI counts
  const totalTickets = tickets.length;
  const pendingApprovalCount = tickets.filter((t) => t.status === 'Chờ duyệt phát sinh').length;
  const readyForCheckoutCount = tickets.filter((t) => t.status === 'Hoàn thành').length;
  const totalRevenue = cashRegister.totalCash + cashRegister.totalTransfer + cashRegister.totalCard;

  // Handlers
  const handleCreateTicket = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);

    if (newTicket.deposit > 0) {
      const newTxn = {
        id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        ticketCode: newTicket.code,
        customer: newTicket.customer,
        type: 'Thu tiền cọc sửa máy',
        amount: newTicket.deposit,
        method: 'Tiền mặt',
        cashier: RECEPTIONIST_INFO.name,
      };

      setCashRegister((prev) => ({
        ...prev,
        totalCash: prev.totalCash + newTicket.deposit,
        transactions: [newTxn, ...prev.transactions],
      }));
    }
  };

  const handleOpenCheckout = (ticket) => {
    setSelectedTicketForAction(ticket);
    setIsCheckoutOpen(true);
  };

  const handleCompletePayment = (ticketKey, paymentRecord) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.key === ticketKey) {
          return {
            ...t,
            status: 'Đã trả máy',
            paymentStatus: 'Đã thanh toán đủ',
            paidAmount: (t.paidAmount || 0) + paymentRecord.amount,
            paidAt: paymentRecord.paidAt,
            paymentMethod: paymentRecord.method,
          };
        }
        return t;
      })
    );

    const newTxn = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      ticketCode: paymentRecord.ticketCode,
      customer: paymentRecord.customer,
      type: 'Thanh toán hoàn tất',
      amount: paymentRecord.amount,
      method: paymentRecord.method,
      cashier: RECEPTIONIST_INFO.name,
    };

    setCashRegister((prev) => {
      const isCash = paymentRecord.method === 'Tiền mặt';
      const isTransfer = paymentRecord.method === 'Chuyển khoản VietQR';
      const isCard = paymentRecord.method === 'Quẹt thẻ POS';

      return {
        ...prev,
        totalCash: isCash ? prev.totalCash + paymentRecord.amount : prev.totalCash,
        totalTransfer: isTransfer ? prev.totalTransfer + paymentRecord.amount : prev.totalTransfer,
        totalCard: isCard ? prev.totalCard + paymentRecord.amount : prev.totalCard,
        transactions: [newTxn, ...prev.transactions],
      };
    });
  };

  const handleOpenProposal = (prop) => {
    setSelectedProposalForAction(prop);
    setIsProposalOpen(true);
  };

  const handleResolveProposal = (proposalId, decision, callNotes) => {
    const targetProp = pendingProposals.find((p) => p.id === proposalId);
    if (!targetProp) return;

    if (callNotes) {
      message.info(`Ghi chú: ${callNotes.slice(0, 40)}...`);
    }

    setPendingProposals((prev) => prev.filter((p) => p.id !== proposalId));

    setTickets((prev) =>
      prev.map((t) => {
        if (t.code === targetProp.ticketCode) {
          if (decision === 'APPROVED') {
            return {
              ...t,
              status: 'Đang sửa',
              estimatedCost: (t.estimatedCost || 0) + targetProp.totalCost,
              items: [
                ...(t.items || []),
                { name: targetProp.proposalTitle, type: 'part', cost: targetProp.totalCost },
              ],
            };
          } else {
            return {
              ...t,
              status: 'Đang sửa',
            };
          }
        }
        return t;
      })
    );

    setIsProposalOpen(false);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const phoneClean = item.phone.replace(/[^0-9]/g, '');
    const searchPhoneClean = searchText.replace(/[^0-9]/g, '');

    const matchText =
      item.code.toLowerCase().includes(searchLower) ||
      item.customer.toLowerCase().includes(searchLower) ||
      item.device.toLowerCase().includes(searchLower) ||
      (searchPhoneClean && phoneClean.includes(searchPhoneClean));

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchText && matchStatus;
  });

  // Table columns for Tickets
  const ticketColumns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{text}</Text>
          {record.priority === 'Khẩn cấp' && (
            <div><Tag color="error" style={{ fontSize: '10px', padding: '0 4px', margin: 0, borderRadius: '2px' }}>Gấp</Tag></div>
          )}
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.customer}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <PhoneOutlined /> {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Thiết bị & Tình trạng',
      key: 'device',
      render: (_, record) => (
        <div style={{ maxWidth: 280 }}>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.device}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {record.customerIssue}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            Serial: {record.serial} • Pass: {record.passcode}
          </div>
        </div>
      ),
    },
    {
      title: 'Tiếp nhận & Hẹn',
      key: 'time',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Nhận: {record.receiveDate}</div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ClockCircleOutlined style={{ color: '#94a3b8' }} />
            {record.appointmentDate}
          </div>
        </div>
      ),
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'technician',
      key: 'technician',
      render: (tech) => (
        <Tag style={{ borderRadius: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155' }}>
          {tech}
        </Tag>
      ),
    },
    {
      title: 'Chi phí & Đặt cọc',
      key: 'cost',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            {(record.estimatedCost || 0).toLocaleString('vi-VN')} ₫
          </div>
          <div>
            <Tag color={record.paymentStatus.includes('Đã thanh toán') ? 'success' : record.deposit > 0 ? 'cyan' : 'default'} style={{ fontSize: '11px', borderRadius: '4px' }}>
              {record.paymentStatus}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'Hoàn thành' && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              style={{ borderRadius: '4px' }}
              onClick={() => handleOpenCheckout(record)}
            >
              Thu tiền
            </Button>
          )}

          {record.status === 'Chờ duyệt phát sinh' && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<PhoneOutlined />}
              style={{ borderRadius: '4px' }}
              onClick={() => {
                const prop = pendingProposals.find((p) => p.ticketCode === record.code);
                if (prop) handleOpenProposal(prop);
                else message.info('Kỹ thuật viên đang cập nhật chi tiết phát sinh.');
              }}
            >
              Gọi duyệt
            </Button>
          )}

          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              style={{ borderRadius: '4px' }}
              onClick={() => setDetailModalTicket(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Proposal columns
  const proposalColumns = [
    {
      title: 'Mã ĐX',
      dataIndex: 'proposalCode',
      key: 'proposalCode',
      render: (text) => <Text strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>{text}</Text>,
    },
    {
      title: 'Phiếu ca máy',
      key: 'ticket',
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.ticketCode}</Tag>
          <div style={{ fontWeight: 500, marginTop: '2px', color: '#0f172a' }}>{record.device}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.customer}</div>
          <a href={`tel:${record.phone}`} style={{ fontSize: '12px', color: '#2563eb' }}>
            <PhoneOutlined /> {record.phone}
          </a>
        </div>
      ),
    },
    {
      title: 'Lỗi phát sinh',
      key: 'detail',
      render: (_, record) => (
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.proposalTitle}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {record.technicalReason}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            KTV: {record.technician} • {record.createdAt}
          </div>
        </div>
      ),
    },
    {
      title: 'Chi phí đề xuất',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (val) => (
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
          {val.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PhoneOutlined />}
          style={{ borderRadius: '4px' }}
          onClick={() => handleOpenProposal(record)}
        >
          Liên hệ duyệt
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Workspace Header Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Tổng đơn tiếp nhận</Text>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {totalTickets}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {RECEPTIONIST_INFO.counter}
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Chờ duyệt phát sinh</Text>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
              {pendingApprovalCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>ca</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Cần liên hệ khách
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Sẵn sàng trả máy</Text>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
              {readyForCheckoutCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>ca</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Chờ thanh toán
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Doanh thu ca hiện tại</Text>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {totalRevenue.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {cashRegister.transactions.length} giao dịch
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
        }}
        items={[
          {
            key: 'tickets',
            label: `Tiếp nhận & Sửa chữa (${tickets.length})`,
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <Space wrap>
                    <Input
                      placeholder="Tìm mã phiếu, khách hàng, SĐT, máy..."
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                      style={{ width: 300, borderRadius: '6px' }}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 170 }}
                      options={[
                        { value: 'ALL', label: 'Tất cả trạng thái' },
                        { value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' },
                        { value: 'Đang kiểm tra', label: 'Đang kiểm tra' },
                        { value: 'Đang sửa', label: 'Đang sửa chữa' },
                        { value: 'Chờ duyệt phát sinh', label: 'Chờ duyệt khách' },
                        { value: 'Hoàn thành', label: 'Sẵn sàng trả' },
                        { value: 'Đã trả máy', label: 'Đã bàn giao' },
                      ]}
                    />
                  </Space>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ borderRadius: '6px' }}
                    onClick={() => setIsIntakeOpen(true)}
                  >
                    Tiếp nhận máy mới
                  </Button>
                </div>

                <Table
                  columns={ticketColumns}
                  dataSource={filteredTickets}
                  rowKey="key"
                  pagination={{ pageSize: 7 }}
                  scroll={{ x: 950 }}
                />
              </div>
            ),
          },
          {
            key: 'proposals',
            label: (
              <span>
                Phê duyệt phát sinh{' '}
                <Badge count={pendingProposals.length} style={{ backgroundColor: '#2563eb', marginLeft: '4px' }} />
              </span>
            ),
            children: (
              <div>
                <Table
                  columns={proposalColumns}
                  dataSource={pendingProposals}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </div>
            ),
          },
          {
            key: 'cashier',
            label: (
              <span>
                Thu ngân & Trả máy{' '}
                <Badge count={readyForCheckoutCount} style={{ backgroundColor: '#16a34a', marginLeft: '4px' }} />
              </span>
            ),
            children: (
              <div>
                <Table
                  columns={ticketColumns.filter((col) => col.key !== 'technician')}
                  dataSource={tickets.filter((t) => t.status === 'Hoàn thành' || t.status === 'Đã trả máy')}
                  rowKey="key"
                  pagination={{ pageSize: 6 }}
                />
              </div>
            ),
          },
          {
            key: 'shift',
            label: (
              <span>
                <WalletOutlined /> Sổ quỹ ca
              </span>
            ),
            children: <ShiftSummaryTab cashRegister={cashRegister} />,
          },
        ]}
      />

      {/* Modal Tiếp nhận máy mới */}
      <IntakeModal
        visible={isIntakeOpen}
        onCancel={() => setIsIntakeOpen(false)}
        onSubmitTicket={handleCreateTicket}
      />

      {/* Modal Thu ngân thanh toán */}
      <PaymentCheckoutModal
        visible={isCheckoutOpen}
        ticket={selectedTicketForAction}
        onCancel={() => setIsCheckoutOpen(false)}
        onCompletePayment={handleCompletePayment}
      />

      {/* Modal Gọi duyệt báo giá phát sinh */}
      <ProposalApprovalModal
        visible={isProposalOpen}
        proposal={selectedProposalForAction}
        onCancel={() => setIsProposalOpen(false)}
        onResolveProposal={handleResolveProposal}
      />

      {/* Modal Xem chi tiết phiếu */}
      {detailModalTicket && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LaptopOutlined style={{ color: '#2563eb' }} />
              <span>Phiếu tiếp nhận — {detailModalTicket.code}</span>
            </div>
          }
          open={Boolean(detailModalTicket)}
          onCancel={() => setDetailModalTicket(null)}
          footer={[
            <Button key="close" onClick={() => setDetailModalTicket(null)}>
              Đóng
            </Button>,
          ]}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '13px' }}>
            <div><strong>Khách hàng:</strong> {detailModalTicket.customer} ({detailModalTicket.phone})</div>
            <div><strong>Thiết bị:</strong> {detailModalTicket.device} (Serial: {detailModalTicket.serial})</div>
            <div><strong>Mật khẩu mở máy:</strong> {detailModalTicket.passcode}</div>
            <div><strong>Phụ kiện kèm:</strong> {detailModalTicket.accessories?.join(', ') || 'Không có'}</div>
            <div><strong>Tình trạng ngoại quan:</strong> {detailModalTicket.condition}</div>
            <div><strong>Khai báo lỗi:</strong> {detailModalTicket.customerIssue}</div>
            <div><strong>KTV phụ trách:</strong> <Tag color="blue">{detailModalTicket.technician}</Tag></div>
            <div><strong>Trạng thái:</strong> {getStatusTag(detailModalTicket.status)}</div>
            <div><strong>Chi phí ước tính:</strong> {(detailModalTicket.estimatedCost || 0).toLocaleString('vi-VN')} ₫</div>
            <div><strong>Tiền cọc:</strong> {(detailModalTicket.deposit || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Reception;