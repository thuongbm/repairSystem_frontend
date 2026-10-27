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
    message.success('Đã lưu biên bản kết sổ quỹ ca làm việc thành công!');
    window.print();
  };

  const columns = [
    {
      title: 'Giờ',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
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
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Nội dung giao dịch',
      dataIndex: 'type',
      key: 'type',
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
        <span style={{ fontWeight: 'bold', color: '#1677ff' }}>
          +{(val || 0).toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Thu ngân',
      dataIndex: 'cashier',
      key: 'cashier',
      render: (text) => <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{text}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner thu ngân */}
      <Card bordered={false} style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white' }}>
        <Row gutter={[20, 20]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px' }}>
                👩‍💼
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{RECEPTIONIST_INFO.name}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>{RECEPTIONIST_INFO.role}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  {RECEPTIONIST_INFO.counter} • {cashRegister.shiftDate}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              style={{ background: '#f59e0b', borderColor: '#f59e0b', borderRadius: '6px' }}
              onClick={handleCloseShift}
            >
              Chốt sổ ca & In biên bản giao ca
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Thống kê doanh thu theo nguồn */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tiền mặt ban đầu (Quỹ lẻ)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '4px 0' }}>
              {cashRegister.openingFloat.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Bàn giao từ ca trước</div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#52c41a' }}>💵 Tiền mặt thu trong ca</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a', margin: '4px 0' }}>
              {cashRegister.totalCash.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              Tiền trong két: <strong>{expectedCashInDrawer.toLocaleString('vi-VN')} ₫</strong>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#1677ff' }}>📱 Chuyển khoản VietQR</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1677ff', margin: '4px 0' }}>
              {cashRegister.totalTransfer.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Đã đối soát qua tài khoản ngân hàng</div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#f0fdf4' }}>
            <div style={{ fontSize: '12px', color: '#047857' }}>🏆 TỔNG DOANH THU CA</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#047857', margin: '4px 0' }}>
              {totalRevenue.toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '11px', color: '#047857' }}>
              {cashRegister.transactions.length} lượt giao dịch hoàn tất
            </div>
          </Card>
        </Col>
      </Row>

      {/* Nhật ký thu tiền */}
      <Card
        bordered={false}
        style={{ borderRadius: '12px' }}
        title="Nhật ký các giao dịch thu tiền thời gian thực trong ca"
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
