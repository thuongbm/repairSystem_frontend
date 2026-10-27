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

const { Title, Text } = Typography;

const getStatusTag = (status) => {
  switch (status) {
    case 'Mới tiếp nhận':
      return <Tag color="default" style={{ borderRadius: '10px', padding: '2px 8px' }}>Mới tiếp nhận</Tag>;
    case 'Đang kiểm tra':
      return <Tag color="cyan" style={{ borderRadius: '10px', padding: '2px 8px' }}>Đang kiểm tra</Tag>;
    case 'Đang sửa':
    case 'Đang sửa chữa':
      return <Tag color="blue" style={{ borderRadius: '10px', padding: '2px 8px' }}>Đang sửa</Tag>;
    case 'Chờ linh kiện':
      return <Tag color="warning" style={{ borderRadius: '10px', padding: '2px 8px' }}>Chờ linh kiện</Tag>;
    case 'Chờ duyệt phát sinh':
      return <Tag color="volcano" style={{ borderRadius: '10px', padding: '2px 8px' }}>⚡ Chờ duyệt khách</Tag>;
    case 'Hoàn thành':
      return <Tag color="success" style={{ borderRadius: '10px', padding: '2px 8px' }}>✓ Sẵn sàng trả máy</Tag>;
    case 'Đã trả máy':
      return <Tag color="purple" style={{ borderRadius: '10px', padding: '2px 8px' }}>Đã bàn giao</Tag>;
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

    // Nếu khách có đặt cọc trước, tự động ghi nhận vào sổ quỹ thu ngân
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

    // Ghi nhận vào sổ quỹ
    const newTxn = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      ticketCode: paymentRecord.ticketCode,
      customer: paymentRecord.customer,
      type: 'Thanh toán trả máy hoàn tất',
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

    // Log call notes for reception audit
    if (callNotes) {
      message.info(`Ghi chú: ${callNotes.slice(0, 40)}...`);
    }

    // Xóa khỏi danh sách chờ gọi
    setPendingProposals((prev) => prev.filter((p) => p.id !== proposalId));

    // Cập nhật trạng thái phiếu máy
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
              status: 'Đang sửa', // Tiếp tục sửa các mục ban đầu
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
          <Text strong style={{ fontFamily: 'monospace', color: '#1677ff' }}>{text}</Text>
          {record.priority === 'Khẩn cấp' && (
            <div><Tag color="red" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>GẤP</Tag></div>
          )}
        </div>
      ),
    },
    {
      title: 'Khách hàng & SĐT',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.customer}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
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
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{record.device}</div>
          <div style={{ fontSize: '12px', color: '#595959', fontStyle: 'italic' }}>
            "{record.customerIssue}"
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
            Serial: {record.serial} • Pass: {record.passcode}
          </div>
        </div>
      ),
    },
    {
      title: 'Tiếp nhận & Hẹn trả',
      key: 'time',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Nhận: {record.receiveDate}</div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#d46b08' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
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
        <Tag color={tech === 'Chưa phân công' ? 'default' : 'geekblue'}>
          {tech}
        </Tag>
      ),
    },
    {
      title: 'Chi phí & Đặt cọc',
      key: 'cost',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>
            {(record.estimatedCost || 0).toLocaleString('vi-VN')} ₫
          </div>
          <div>
            <Tag color={record.paymentStatus.includes('Đã thanh toán') ? 'success' : record.deposit > 0 ? 'cyan' : 'default'} style={{ fontSize: '11px' }}>
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
              style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: '4px' }}
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
              onClick={() => {
                const prop = pendingProposals.find((p) => p.ticketCode === record.code);
                if (prop) handleOpenProposal(prop);
                else message.info('Kỹ thuật viên đang cập nhật chi tiết phát sinh.');
              }}
            >
              Gọi duyệt
            </Button>
          )}

          <Tooltip title="Xem chi tiết phiếu sửa chữa">
            <Button
              size="small"
              icon={<EyeOutlined />}
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
      render: (text) => <Text strong style={{ color: '#1677ff', fontFamily: 'monospace' }}>{text}</Text>,
    },
    {
      title: 'Phiếu ca máy',
      key: 'ticket',
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.ticketCode}</Tag>
          <div style={{ fontWeight: 600, marginTop: '2px' }}>{record.device}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng & Hotline',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.customer}</div>
          <a href={`tel:${record.phone}`} style={{ fontSize: '13px', fontWeight: 'bold' }}>
            <PhoneOutlined /> {record.phone}
          </a>
        </div>
      ),
    },
    {
      title: 'Hạng mục lỗi phát sinh từ thợ',
      key: 'detail',
      render: (_, record) => (
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{record.proposalTitle}</div>
          <div style={{ fontSize: '12px', color: '#595959', fontStyle: 'italic' }}>
            "{record.technicalReason}"
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
            KTV phát hiện: {record.technician} • {record.createdAt}
          </div>
        </div>
      ),
    },
    {
      title: 'Chi phí phát sinh',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (val) => (
        <div>
          <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#cf1322' }}>
            {val.toLocaleString('vi-VN')} ₫
          </span>
        </div>
      ),
    },
    {
      title: 'Thao tác Lễ tân',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          style={{ background: '#faad14', borderColor: '#faad14' }}
          icon={<PhoneOutlined />}
          onClick={() => handleOpenProposal(record)}
        >
          Gọi khách chốt duyệt
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Banner: Lễ tân & Thu ngân */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          background: '#ffffff',
        }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: '#fff7e6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fa8c16',
                  fontSize: '24px',
                }}
              >
                <LaptopOutlined />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937' }}>
                  Bàn làm việc Lễ tân & Thu ngân (Front Desk & Cashier)
                </Title>
                <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>Trưởng ca: <Text strong style={{ color: '#1f2937' }}>{RECEPTIONIST_INFO.name}</Text></span>
                  <span>•</span>
                  <span>{RECEPTIONIST_INFO.counter}</span>
                  <span>•</span>
                  <Tag color="orange" style={{ borderRadius: '10px', margin: 0 }}>
                    Tiếp nhận • Báo giá • Thu ngân
                  </Tag>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <Row gutter={12}>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Tổng đơn máy</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{totalTickets}</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Cần gọi duyệt</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {pendingApprovalCount} ca
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Sẵn sàng trả máy</Text>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    {readyForCheckoutCount} ca
                  </div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Doanh thu ca</Text>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0958d9' }}>
                    {totalRevenue.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        items={[
          {
            key: 'tickets',
            label: (
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                <LaptopOutlined /> Quản lý tiếp nhận máy ({tickets.length})
              </span>
            ),
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <Space wrap>
                    <Input
                      placeholder="Tìm mã phiếu, khách hàng, số điện thoại, model máy..."
                      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                      style={{ width: 320, borderRadius: '6px' }}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 180 }}
                      options={[
                        { value: 'ALL', label: 'Tất cả trạng thái' },
                        { value: 'Mới tiếp nhận', label: 'Mới tiếp nhận' },
                        { value: 'Đang kiểm tra', label: 'Đang kiểm tra' },
                        { value: 'Đang sửa', label: 'Đang sửa chữa' },
                        { value: 'Chờ duyệt phát sinh', label: 'Chờ duyệt khách' },
                        { value: 'Hoàn thành', label: '✓ Hoàn thành (Chờ trả)' },
                        { value: 'Đã trả máy', label: 'Đã bàn giao khách' },
                      ]}
                    />
                  </Space>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ borderRadius: '6px', background: '#1677ff' }}
                    onClick={() => setIsIntakeOpen(true)}
                  >
                    + Tiếp nhận máy mới
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
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                <PhoneOutlined /> Gọi duyệt báo giá phát sinh{' '}
                <Badge count={pendingProposals.length} style={{ backgroundColor: '#ff4d4f', marginLeft: '4px' }} />
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Title level={5} style={{ margin: 0 }}>Danh sách lỗi phát sinh từ thợ cần liên hệ khách hàng</Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Lễ tân gọi điện giải thích lý do kỹ thuật cho khách hàng, xin duyệt chi phí trước khi KTV tiến hành can thiệp phần cứng.
                  </Text>
                </div>

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
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                <DollarOutlined /> Thu ngân & Trả máy{' '}
                <Badge count={readyForCheckoutCount} style={{ backgroundColor: '#52c41a', marginLeft: '4px' }} />
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Title level={5} style={{ margin: 0 }}>Danh sách máy đã sửa xong — Chờ khách đến nhận & Thanh toán</Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Thu ngân kiểm tra chi phí, thu tiền (Tiền mặt / VietQR / Quẹt thẻ POS), xuất hóa đơn và kích hoạt tem bảo hành.
                  </Text>
                </div>

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
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                <WalletOutlined /> Sổ quỹ ca làm việc
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
              <LaptopOutlined style={{ color: '#1677ff' }} />
              <span>Chi tiết phiếu tiếp nhận — {detailModalTicket.code}</span>
            </div>
          }
          open={Boolean(detailModalTicket)}
          onCancel={() => setDetailModalTicket(null)}
          footer={[
            <Button key="close" onClick={() => setDetailModalTicket(null)}>
              Đóng
            </Button>,
          ]}
          width={650}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div><strong>Khách hàng:</strong> {detailModalTicket.customer} ({detailModalTicket.phone})</div>
            <div><strong>Thiết bị:</strong> {detailModalTicket.device} (Serial: {detailModalTicket.serial})</div>
            <div><strong>Mật khẩu mở máy:</strong> {detailModalTicket.passcode}</div>
            <div><strong>Phụ kiện kèm theo:</strong> {detailModalTicket.accessories?.join(', ') || 'Không có'}</div>
            <div><strong>Tình trạng lúc nhận:</strong> {detailModalTicket.condition}</div>
            <div><strong>Khai báo lỗi:</strong> {detailModalTicket.customerIssue}</div>
            <div><strong>Kỹ thuật viên phụ trách:</strong> <Tag color="blue">{detailModalTicket.technician}</Tag></div>
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
