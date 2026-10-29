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
  Alert,
  message
} from 'antd';
import {
  DollarOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

const PaymentCheckoutModal = ({ visible, ticket, onCancel, onCompletePayment }) => {
  const [paymentMethod, setPaymentMethod] = useState('QR'); // 'CASH' | 'QR' | 'CARD'
  const [customerGivenCash, setCustomerGivenCash] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [warrantyMonths, setWarrantyMonths] = useState(6);
  const [completedPayment, setCompletedPayment] = useState(null);

  if (!ticket) return null;

  // Tính toán chi phí
  const itemsList = ticket.items && ticket.items.length > 0
    ? ticket.items
    : [
        { name: `Công sửa chữa & xử lý lỗi (${ticket.customerIssue})`, type: 'service', cost: ticket.estimatedCost || 650000 },
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
          <span style={{ fontWeight: 500 }}>{text}</span>
          <div>
            <Tag color={record.type === 'part' ? 'blue' : 'green'} style={{ fontSize: '10px' }}>
              {record.type === 'part' ? 'Linh kiện thay thế' : 'Dịch vụ kỹ thuật'}
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
      render: (val) => <span style={{ fontWeight: 600 }}>{(val || 0).toLocaleString('vi-VN')} ₫</span>,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>
              Thu ngân thanh toán & Xuất hóa đơn — Phiếu {ticket.code}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 'normal' }}>
              Khách hàng: {ticket.customer} ({ticket.phone}) | Thiết bị: {ticket.device}
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={handleClose}>
          {completedPayment ? 'Hoàn tất' : 'Đóng'}
        </Button>,
        completedPayment && (
          <Button key="print" type="default" icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
            In lại hóa đơn / Tem bảo hành
          </Button>
        ),
        !completedPayment && (
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            onClick={handleConfirmCheckout}
          >
            Xác nhận đã nhận {remainingDue.toLocaleString('vi-VN')} ₫ & Bàn giao máy
          </Button>
        ),
      ]}
    >
      {completedPayment ? (
        <Card size="small" style={{ border: '2px solid #52c41a', borderRadius: '8px', background: '#f6ffed' }}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            <h3 style={{ margin: '12px 0 4px 0', color: '#237804' }}>THANH TOÁN THÀNH CÔNG!</h3>
            <div style={{ fontSize: '14px', color: '#595959' }}>
              Đã ghi nhận thanh toán <strong>{completedPayment.amount.toLocaleString('vi-VN')} ₫</strong> bằng phương thức{' '}
              <Tag color="green">{completedPayment.method}</Tag>
            </div>
            <div style={{ marginTop: '12px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #d9d9d9', textAlign: 'left' }}>
              <div><strong>Mã phiếu:</strong> {ticket.code} — Thiết bị: {ticket.device}</div>
              <div><strong>Khách hàng:</strong> {ticket.customer} ({ticket.phone})</div>
              <div><strong>Kích hoạt bảo hành:</strong> <Tag color="gold" icon={<SafetyCertificateOutlined />}>{completedPayment.warrantyMonths} Tháng chính hãng</Tag></div>
              <div><strong>Thời hạn bảo hành đến:</strong> {completedPayment.expiryDate}</div>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Bảng kê các mục thanh toán */}
          <Table
            columns={itemColumns}
            dataSource={itemsList.map((item, idx) => ({ ...item, key: idx }))}
            pagination={false}
            size="small"
            style={{ marginBottom: '16px' }}
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card size="small" title="Phương thức thanh toán" style={{ height: '100%' }}>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <Radio value="QR">
                    <span style={{ fontWeight: 600 }}>
                      <QrcodeOutlined style={{ color: '#1677ff' }} /> Chuyển khoản VietQR (Khuyên dùng)
                    </span>
                  </Radio>
                  <Radio value="CASH">
                    <span style={{ fontWeight: 600 }}>
                      <DollarOutlined style={{ color: '#52c41a' }} /> Tiền mặt trực tiếp tại quầy
                    </span>
                  </Radio>
                  <Radio value="CARD">
                    <span style={{ fontWeight: 600 }}>
                      <CreditCardOutlined style={{ color: '#fa8c16' }} /> Quẹt thẻ máy POS (Visa/Master/Napas)
                    </span>
                  </Radio>
                </Radio.Group>

                <Divider style={{ margin: '12px 0' }} />

                {paymentMethod === 'QR' && (
                  <div style={{ textAlign: 'center', background: '#f0f5ff', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#1677ff', fontWeight: 600, marginBottom: '6px' }}>
                      QUÉT MÃ VIETQR ĐỂ THANH TOÁN CHÍNH XÁC
                    </div>
                    {/* Mock VietQR preview */}
                    <div
                      style={{
                        width: '140px',
                        height: '140px',
                        background: '#ffffff',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                      }}
                    >
                      <QrcodeOutlined style={{ fontSize: '80px', color: '#1e3a8a' }} />
                      <div style={{ fontSize: '10px', color: '#8c8c8c' }}>TechFix VietQR</div>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '6px' }}>
                      Nội dung CK: <strong style={{ color: '#0958d9' }}>{ticket.code} {ticket.phone}</strong>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CASH' && (
                  <div>
                    <div style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                      Tiền khách đưa (₫):
                    </div>
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập số tiền khách đưa"
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                      value={customerGivenCash}
                      onChange={(val) => setCustomerGivenCash(val || 0)}
                      min={0}
                      step={50000}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '14px' }}>
                      <span>Tiền thối lại cho khách:</span>
                      <strong style={{ color: '#cf1322', fontSize: '16px' }}>
                        {changeCash.toLocaleString('vi-VN')} ₫
                      </strong>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <Alert
                    type="info"
                    showIcon
                    message="Quẹt thẻ qua máy POS ngân hàng"
                    description="Vui lòng kiểm tra hóa đơn in từ máy POS khớp với số tiền cần thu trước khi xác nhận bàn giao máy."
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card size="small" title="Tổng kết chi phí & Bảo hành" style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Tổng tiền dịch vụ & linh kiện:</span>
                  <strong>{subtotal.toLocaleString('vi-VN')} ₫</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Chiết khấu / Giảm giá voucher:</span>
                  <InputNumber
                    size="small"
                    style={{ width: '120px' }}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                    <span>Khách đã đặt cọc trước:</span>
                    <strong>- {deposit.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                )}

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 'bold' }}>SỐ TIỀN CẦN THU:</span>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#cf1322' }}>
                    {remainingDue.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>
                    Kích hoạt thời hạn tem bảo hành:
                  </div>
                  <Select
                    value={warrantyMonths}
                    onChange={setWarrantyMonths}
                    style={{ width: '100%' }}
                    options={[
                      { value: 1, label: '🛡️ Bảo hành 01 Tháng (Phần cứng linh kiện cơ bản)' },
                      { value: 3, label: '🛡️ Bảo hành 03 Tháng (Tiêu chuẩn xưởng)' },
                      { value: 6, label: '🛡️ Bảo hành 06 Tháng (Chính hãng linh kiện mới)' },
                      { value: 12, label: '🛡️ Bảo hành 12 Tháng (Đổi mới toàn diện)' },
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
