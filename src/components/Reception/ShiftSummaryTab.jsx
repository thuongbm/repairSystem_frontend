import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  message
} from 'antd';
import {
  DollarOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  LockOutlined
} from '@ant-design/icons';
import { RECEPTIONIST_INFO } from './mockReceptionData';

const ShiftSummaryTab = ({ cashRegister }) => {
  const totalRevenue = cashRegister.totalCash + cashRegister.totalTransfer + cashRegister.totalCard;
  const expectedCashInDrawer = cashRegister.openingFloat + cashRegister.totalCash;

  const handleCloseShift = () => {
    message.success('Đã lưu biên bản kết ca làm việc thành công');
    window.print();
  };

  const columns = [
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{text}</span>,
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (text) => <span style={{ fontWeight: 500, color: '#0f172a' }}>{text}</span>,
    },
    {
      title: 'Giao dịch',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <span style={{ color: '#334155' }}>{text}</span>,
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (method) => {
        if (method === 'Chuyển khoản VietQR') return <Tag color="cyan"><QrcodeOutlined /> {method}</Tag>;
        if (method === 'Tiền mặt') return <Tag color="green"><DollarOutlined /> {method}</Tag>;
        return <Tag color="orange"><CreditCardOutlined /> {method}</Tag>;
      },
    },
    {
      title: 'Số tiền thu',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          +{(val || 0).toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Thu ngân',
      dataIndex: 'cashier',
      key: 'cashier',
      render: (text) => <span style={{ fontSize: '12px', color: '#64748b' }}>{text}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Banner */}
      <Card bordered={false} style={{ borderRadius: '8px', background: '#0f172a', color: 'white' }}>
        <Row gutter={[20, 20]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: 700,
                color: '#34d399'
              }}>
                TN
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>{RECEPTIONIST_INFO.name}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {RECEPTIONIST_INFO.role} • {RECEPTIONIST_INFO.counter} • {cashRegister.shiftDate}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              style={{ borderRadius: '6px' }}
              onClick={handleCloseShift}
            >
              Kết sổ ca & In biên bản
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Thống kê doanh thu theo nguồn */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Tiền mặt ban đầu</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
              {cashRegister.openingFloat.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Quỹ lẻ đầu ca</div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#16a34a' }}>Tiền mặt trong ca</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
              {cashRegister.totalCash.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Két tiền: {expectedCashInDrawer.toLocaleString('vi-VN')} ₫
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#2563eb' }}>Chuyển khoản VietQR</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
              {cashRegister.totalTransfer.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Đã đối soát tài khoản</div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng thu ca</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
              {totalRevenue.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {cashRegister.transactions.length} giao dịch hoàn tất
            </div>
          </Card>
        </Col>
      </Row>

      {/* Nhật ký thu tiền */}
      <Card
        bordered={false}
        style={{ borderRadius: '8px' }}
        title={<span style={{ fontSize: '14px', fontWeight: 600 }}>Nhật ký giao dịch ca làm việc</span>}
      >
        <Table
          columns={columns}
          dataSource={cashRegister.transactions}
          rowKey="id"
          pagination={{ pageSize: 6 }}
        />
      </Card>
    </div>
  );
};

export default ShiftSummaryTab;