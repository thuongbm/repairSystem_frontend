import { useState } from 'react';
import {
  Modal,
  Row,
  Col,
  Card,
  Table,
  Button,
  Radio,
  InputNumber,
  Select,
  Tag,
  Divider,
  message
} from 'antd';
import {
  DollarOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  CreditCardOutlined
} from '@ant-design/icons';

const PaymentCheckoutModal = ({ visible, ticket, onCancel, onCompletePayment }) => {
  const [paymentMethod, setPaymentMethod] = useState('QR'); // 'CASH' | 'QR' | 'CARD'
  const [customerGivenCash, setCustomerGivenCash] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [warrantyMonths, setWarrantyMonths] = useState(6);
  const [completedPayment, setCompletedPayment] = useState(null);

  if (!ticket) return null;

  const itemsList = ticket.items && ticket.items.length > 0
    ? ticket.items
    : [
        { name: `Công sửa chữa & xử lý (${ticket.customerIssue})`, type: 'service', cost: ticket.estimatedCost || 650000 },
      ];

  const subtotal = itemsList.reduce((sum, item) => sum + (item.cost || 0), 0);
  const deposit = ticket.deposit || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const remainingDue = Math.max(0, grandTotal - deposit);
  const changeCash = Math.max(0, (customerGivenCash || 0) - remainingDue);

  const handleConfirmCheckout = () => {
    if (paymentMethod === 'CASH' && (customerGivenCash || 0) < remainingDue) {
      message.warning('Số tiền khách đưa chưa đủ để thanh toán!');
      return;
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + warrantyMonths * 30 * 24 * 3600 * 1000).toLocaleDateString('vi-VN');

    const paymentRecord = {
      ticketCode: ticket.code,
      customer: ticket.customer,
      amount: remainingDue,
      method: paymentMethod === 'QR' ? 'Chuyển khoản VietQR' : paymentMethod === 'CASH' ? 'Tiền mặt' : 'Quẹt thẻ POS',
      paidAt: now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      warrantyMonths,
      expiryDate,
    };

    onCompletePayment(ticket.key, paymentRecord);
    setCompletedPayment(paymentRecord);
    message.success(`Thanh toán hoàn tất cho phiếu ${ticket.code}!`);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleClose = () => {
    setCompletedPayment(null);
    onCancel();
  };

  const itemColumns = [
    {
      title: 'Hạng mục dịch vụ / Vật tư',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: 500, color: '#0f172a' }}>{text}</span>
          <div>
            <Tag style={{ fontSize: '11px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}>
              {record.type === 'part' ? 'Linh kiện' : 'Công thợ'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'cost',
      key: 'cost',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{(val || 0).toLocaleString('vi-VN')} ₫</span>,
    },
  ];

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
              Thanh toán & Xuất hóa đơn — {ticket.code}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>
              {ticket.customer} ({ticket.phone}) • {ticket.device}
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={780}
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={handleClose}>
          {completedPayment ? 'Hoàn tất' : 'Đóng'}
        </Button>,
        completedPayment && (
          <Button key="print" type="default" icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
            In hóa đơn
          </Button>
        ),
        !completedPayment && (
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmCheckout}
          >
            Xác nhận thanh toán ({remainingDue.toLocaleString('vi-VN')} ₫)
          </Button>
        ),
      ]}
    >
      {completedPayment ? (
        <Card size="small" style={{ border: '1px solid #bbf7d0', borderRadius: '8px', background: '#f0fdf4' }}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <CheckCircleOutlined style={{ fontSize: '40px', color: '#16a34a' }} />
            <h3 style={{ margin: '10px 0 4px 0', color: '#15803d' }}>THANH TOÁN THÀNH CÔNG</h3>
            <div style={{ fontSize: '14px', color: '#334155' }}>
              Đã ghi nhận <strong>{completedPayment.amount.toLocaleString('vi-VN')} ₫</strong> qua{' '}
              <Tag color="green">{completedPayment.method}</Tag>
            </div>
            <div style={{ marginTop: '12px', background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px' }}>
              <div><strong>Mã phiếu:</strong> {ticket.code} — {ticket.device}</div>
              <div><strong>Khách hàng:</strong> {ticket.customer} ({ticket.phone})</div>
              <div><strong>Bảo hành:</strong> {completedPayment.warrantyMonths} Tháng (Đến: {completedPayment.expiryDate})</div>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
          <Table
            columns={itemColumns}
            dataSource={itemsList.map((item, idx) => ({ ...item, key: idx }))}
            pagination={false}
            size="small"
            style={{ marginBottom: '16px' }}
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card size="small" title={<span style={{ fontSize: '13px', fontWeight: 600 }}>Phương thức thanh toán</span>} style={{ height: '100%', borderRadius: '6px' }}>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <Radio value="QR">
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>
                      <QrcodeOutlined style={{ color: '#2563eb' }} /> Chuyển khoản VietQR
                    </span>
                  </Radio>
                  <Radio value="CASH">
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>
                      <DollarOutlined style={{ color: '#16a34a' }} /> Tiền mặt tại quầy
                    </span>
                  </Radio>
                  <Radio value="CARD">
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>
                      <CreditCardOutlined style={{ color: '#f59e0b' }} /> Quẹt thẻ máy POS
                    </span>
                  </Radio>
                </Radio.Group>

                <Divider style={{ margin: '12px 0' }} />

                {paymentMethod === 'QR' && (
                  <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        background: '#ffffff',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                      }}
                    >
                      <QrcodeOutlined style={{ fontSize: '64px', color: '#0f172a' }} />
                      <div style={{ fontSize: '10px', color: '#64748b' }}>VietQR Pro</div>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '6px', color: '#475569' }}>
                      Cú pháp: <strong style={{ color: '#0f172a' }}>{ticket.code} {ticket.phone}</strong>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CASH' && (
                  <div>
                    <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>
                      Tiền khách đưa (₫):
                    </div>
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Số tiền khách đưa"
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                      value={customerGivenCash}
                      onChange={(val) => setCustomerGivenCash(val || 0)}
                      min={0}
                      step={50000}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Tiền thối lại:</span>
                      <strong style={{ color: '#0f172a', fontSize: '15px' }}>
                        {changeCash.toLocaleString('vi-VN')} ₫
                      </strong>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card size="small" title={<span style={{ fontSize: '13px', fontWeight: 600 }}>Chi phí & Bảo hành</span>} style={{ height: '100%', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Tổng tiền dịch vụ:</span>
                  <strong>{subtotal.toLocaleString('vi-VN')} ₫</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Chiết khấu / Giảm:</span>
                  <InputNumber
                    size="small"
                    style={{ width: '110px' }}
                    min={0}
                    max={subtotal}
                    step={10000}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                    value={discount}
                    onChange={(val) => setDiscount(val || 0)}
                  />
                </div>

                {deposit > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#16a34a' }}>
                    <span>Đã đặt cọc:</span>
                    <strong>- {deposit.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                )}

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>CẦN THANH TOÁN:</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                    {remainingDue.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div>
                  <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>
                    Thời hạn bảo hành:
                  </div>
                  <Select
                    value={warrantyMonths}
                    onChange={setWarrantyMonths}
                    style={{ width: '100%' }}
                    options={[
                      { value: 1, label: 'Bảo hành 01 Tháng' },
                      { value: 3, label: 'Bảo hành 03 Tháng' },
                      { value: 6, label: 'Bảo hành 06 Tháng' },
                      { value: 12, label: 'Bảo hành 12 Tháng' },
                    ]}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};

export default PaymentCheckoutModal;