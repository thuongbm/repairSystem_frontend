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
      render: (text) => <Text strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{text}</Text>,
    },
    {
      title: 'Thiết bị & Công việc',
      key: 'deviceTask',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.device}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{record.task}</div>
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
      title: 'Công thợ (₫)',
      dataIndex: 'laborPay',
      key: 'laborPay',
      render: (val) => (
        <Text strong style={{ color: '#0f172a' }}>
          {val.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Hoa hồng vật tư (₫)',
      dataIndex: 'commissionPay',
      key: 'commissionPay',
      render: (val) => (
        <Text style={{ color: '#16a34a' }}>
          +{val.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Tổng tích lũy',
      dataIndex: 'total',
      key: 'total',
      render: (val) => (
        <Text strong style={{ color: '#0f172a', fontSize: '13px' }}>
          {val.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="success" style={{ borderRadius: '6px' }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header filter & Technician Profile Card */}
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
                color: '#60a5fa'
              }}>
                TA
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>{TECHNICIAN_INFO.name}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {TECHNICIAN_INFO.role} • {TECHNICIAN_INFO.workstation} • {TECHNICIAN_INFO.shift}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Kỳ:</span>
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
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Ca máy hoàn thành</Text>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {productivityStats.completedJobsCount} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#94a3b8' }}>ca</span>
                </div>
                <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <RiseOutlined /> +14.2% so với kỳ trước
                </div>
              </div>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '6px', color: '#2563eb', fontSize: '16px' }}>
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Tỉ lệ SLA đúng hẹn</Text>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                  {productivityStats.slaRate}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Mục tiêu SLA: &gt;95.0%
                </div>
              </div>
              <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '6px', color: '#16a34a', fontSize: '16px' }}>
                <FieldTimeOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Đánh giá trung bình</Text>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  4.9 <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>/ 5.0</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  31 lượt đánh giá
                </div>
              </div>
              <div style={{ padding: '8px', background: '#fefce8', borderRadius: '6px', color: '#ca8a04', fontSize: '16px' }}>
                <StarOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Thu nhập tích lũy</Text>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {productivityStats.totalGrossIncome.toLocaleString('vi-VN')} ₫
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>
                  Thực nhận: {productivityStats.remainingBalance.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', color: '#475569', fontSize: '16px' }}>
                <WalletOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ tiến độ & năng suất */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ borderRadius: '8px' }} title={<span style={{ fontSize: '14px', fontWeight: 600 }}>Năng suất & thu nhập 7 ngày gần nhất</span>}>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyProductivityChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#e2e8f0" />
                  <YAxis yAxisId="left" orientation="left" stroke="#2563eb" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#16a34a" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Công thợ (nghìn ₫)') return [`${value * 1000} ₫`, 'Công thợ'];
                      if (name === 'Số ca máy') return [`${value} ca`, 'Ca hoàn thành'];
                      return [value, name];
                    }}
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="completed" name="Số ca máy" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="right" dataKey="laborPay" name="Công thợ (nghìn ₫)" fill="#16a34a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ borderRadius: '8px', height: '100%' }} title={<span style={{ fontSize: '14px', fontWeight: 600 }}>Cơ cấu thu nhập</span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <Text type="secondary">Công thợ sửa chữa:</Text>
                  <Text strong>{productivityStats.totalLaborEarned.toLocaleString('vi-VN')} ₫</Text>
                </div>
                <Progress percent={83} strokeColor="#2563eb" showInfo={false} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <Text type="secondary">Hoa hồng linh kiện:</Text>
                  <Text strong>{productivityStats.totalPartsCommission.toLocaleString('vi-VN')} ₫</Text>
                </div>
                <Progress percent={17} strokeColor="#16a34a" showInfo={false} />
              </div>

              <Divider style={{ margin: '6px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <Text type="secondary">Tổng gộp:</Text>
                <Text strong style={{ color: '#0f172a' }}>
                  {productivityStats.totalGrossIncome.toLocaleString('vi-VN')} ₫
                </Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <Text type="secondary">Tạm ứng:</Text>
                <Text type="danger">
                  - {productivityStats.advancePaid.toLocaleString('vi-VN')} ₫
                </Text>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Thực nhận cuối kỳ:</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>
                  {productivityStats.remainingBalance.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bảng kê chi tiết từng ca máy đã hoàn thành */}
      <Card bordered={false} style={{ borderRadius: '8px' }} title={<span style={{ fontSize: '14px', fontWeight: 600 }}>Chi tiết ca máy hoàn thành</span>}>
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