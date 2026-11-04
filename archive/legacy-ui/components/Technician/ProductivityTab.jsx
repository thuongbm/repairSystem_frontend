import { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Table, 
  Select, 
  Progress, 
  Divider
} from 'antd';
import { 
  CheckCircleOutlined, 
  FieldTimeOutlined, 
  RiseOutlined, 
  StarOutlined, 
  WalletOutlined
} from '@ant-design/icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  productivityStats, 
  dailyProductivityChart, 
  commissionHistory,
  TECHNICIAN_INFO 
} from './mockData';

const { Text } = Typography;

const ProductivityTab = () => {
  const [period, setPeriod] = useState('month');

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'jobCode',
      key: 'jobCode',
      render: (text) => <Text strong style={{ fontFamily: 'monospace', color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: 'Thiết bị & Công việc đã xử lý',
      key: 'deviceTask',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: '600' }}>{record.device}</div>
          <div style={{ fontSize: '12px', color: '#595959' }}>{record.task}</div>
        </div>
      ),
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completedDate',
      key: 'completedDate',
      render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>,
    },
    {
      title: 'Công thợ nhận (₫)',
      dataIndex: 'laborPay',
      key: 'laborPay',
      render: (val) => (
        <Text strong style={{ color: '#0958d9' }}>
          {val.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Hoa hồng vật tư (₫)',
      dataIndex: 'commissionPay',
      key: 'commissionPay',
      render: (val) => (
        <Text style={{ color: '#389e0d' }}>
          +{val.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Tổng tích lũy ca',
      dataIndex: 'total',
      key: 'total',
      render: (val) => (
        <Text strong style={{ color: '#cf1322', fontSize: '13px' }}>
          {val.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái kỳ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="success" style={{ borderRadius: '10px' }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header filter & Technician Profile Card */}
      <Card bordered={false} style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white' }}>
        <Row gutter={[20, 20]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
                👨‍🔧
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{TECHNICIAN_INFO.name}</div>
                <div style={{ fontSize: '13px', opacity: 0.85 }}>{TECHNICIAN_INFO.role}</div>
                <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>
                  {TECHNICIAN_INFO.workstation} • {TECHNICIAN_INFO.shift}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', display: 'inline-block' }}>
              <span style={{ fontSize: '12px', opacity: 0.8, marginRight: '8px' }}>Kỳ thống kê:</span>
              <Select
                value={period}
                onChange={setPeriod}
                style={{ width: 140 }}
                options={[
                  { value: 'week', label: 'Tuần này' },
                  { value: 'month', label: 'Tháng 09/2026' },
                  { value: 'prev_month', label: 'Tháng 08/2026' },
                ]}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Ca máy đã xử lý thành công</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginTop: '4px' }}>
                  {productivityStats.completedJobsCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#8c8c8c' }}>ca máy</span>
                </div>
                <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '4px' }}>
                  <RiseOutlined /> +14.2% so với cùng kỳ
                </div>
              </div>
              <div style={{ padding: '10px', background: '#e6f4ff', borderRadius: '10px', color: '#1677ff', fontSize: '20px' }}>
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Tỉ lệ đúng hẹn (SLA)</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginTop: '4px' }}>
                  {productivityStats.slaRate}
                </div>
                <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px' }}>
                  Mục tiêu xưởng: &gt;95.0%
                </div>
              </div>
              <div style={{ padding: '10px', background: '#f6ffed', borderRadius: '10px', color: '#52c41a', fontSize: '20px' }}>
                <FieldTimeOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Đánh giá dịch vụ</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14', marginTop: '4px' }}>
                  4.9 <span style={{ fontSize: '13px', color: '#8c8c8c' }}>/ 5.0</span>
                </div>
                <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '4px' }}>
                  31 lượt đánh giá 5 sao ⭐
                </div>
              </div>
              <div style={{ padding: '10px', background: '#fffbe6', borderRadius: '10px', color: '#faad14', fontSize: '20px' }}>
                <StarOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#fff0f6', borderColor: '#ffd6e7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Thu nhập tích lũy kỳ này</Text>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#c41d7f', marginTop: '4px' }}>
                  {productivityStats.totalGrossIncome.toLocaleString('vi-VN')} ₫
                </div>
                <div style={{ fontSize: '11px', color: '#722ed1', marginTop: '4px' }}>
                  Còn thực nhận: {productivityStats.remainingBalance.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <div style={{ padding: '10px', background: '#ffd6e7', borderRadius: '10px', color: '#c41d7f', fontSize: '20px' }}>
                <WalletOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ tiến độ & năng suất */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ borderRadius: '12px' }} title="Biểu đồ năng suất xử lý ca máy & thu nhập 7 ngày gần nhất">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProductivityChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#1677ff" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#52c41a" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Công thợ (nghìn ₫)') return [`${value * 1000} ₫`, 'Công thợ'];
                      if (name === 'Số ca máy') return [`${value} ca`, 'Ca hoàn thành'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="completed" name="Số ca máy" fill="#1677ff" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="laborPay" name="Công thợ (nghìn ₫)" fill="#52c41a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ borderRadius: '12px', height: '100%' }} title="Chi tiết cơ cấu thu nhập kỳ này">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text>Công thợ sửa chữa trực tiếp:</Text>
                  <Text strong>{productivityStats.totalLaborEarned.toLocaleString('vi-VN')} ₫</Text>
                </div>
                <Progress percent={83} strokeColor="#1677ff" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text>Hoa hồng linh kiện & nâng cấp:</Text>
                  <Text strong>{productivityStats.totalPartsCommission.toLocaleString('vi-VN')} ₫</Text>
                </div>
                <Progress percent={17} strokeColor="#52c41a" showInfo={false} />
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Tổng thu nhập gộp:</Text>
                <Text strong style={{ fontSize: '15px', color: '#1f2937' }}>
                  {productivityStats.totalGrossIncome.toLocaleString('vi-VN')} ₫
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Đã tạm ứng giữa kỳ:</Text>
                <Text type="danger">
                  - {productivityStats.advancePaid.toLocaleString('vi-VN')} ₫
                </Text>
              </div>

              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#389e0d' }}>Thực nhận cuối kỳ:</div>
                  <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Chốt công ngày 05 hàng tháng</div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#237804' }}>
                  {productivityStats.remainingBalance.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bảng kê chi tiết từng ca máy đã hoàn thành */}
      <Card bordered={false} style={{ borderRadius: '12px' }} title="Bảng kê chi tiết mức công thợ & hoa hồng theo từng ca máy hoàn thành">
        <Table
          columns={columns}
          dataSource={commissionHistory}
          rowKey="key"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 750 }}
        />
      </Card>
    </div>
  );
};

export default ProductivityTab;
