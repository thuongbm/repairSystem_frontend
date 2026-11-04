import React from 'react';
import { Card, Row, Col, Typography, Statistic, Tag } from 'antd';
import { 
  WalletOutlined, 
  CalendarOutlined, 
  InboxOutlined, 
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';

const { Title, Text } = Typography;

const revenueData = [
  { name: 'T1', service: 35, parts: 20 },
  { name: 'T2', service: 40, parts: 22 },
  { name: 'T3', service: 42, parts: 28 },
  { name: 'T4', service: 38, parts: 25 },
  { name: 'T5', service: 50, parts: 32 },
  { name: 'T6', service: 52, parts: 38 },
  { name: 'T7', service: 58, parts: 42 },
  { name: 'T8', service: 55, parts: 36 },
  { name: 'T9', service: 62, parts: 44 },
  { name: 'T10', service: 68, parts: 48 },
  { name: 'T11', service: 70, parts: 52 },
  { name: 'T12', service: 78, parts: 58 },
];

const productivityData = [
  { name: 'Văn Hùng', tasks: 45 },
  { name: 'Quốc Bảo', tasks: 40 },
  { name: 'Minh Tuấn', tasks: 38 },
  { name: 'Gia Huy', tasks: 35 },
  { name: 'Thành Nam', tasks: 30 },
];

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Row gutter={[20, 20]}>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Doanh thu hôm nay</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#1f2937' }}>18.450.000 ₫</Title>
                <Tag color="success" icon={<ArrowUpOutlined />} style={{ borderRadius: '10px' }}>
                  12.4%
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>so với hôm qua</Text>
              </div>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                <WalletOutlined style={{ fontSize: '20px' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Doanh thu tháng này</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#1f2937' }}>486.200.000 ₫</Title>
                <Tag color="success" icon={<ArrowUpOutlined />} style={{ borderRadius: '10px' }}>
                  8.1%
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>so với tháng trước</Text>
              </div>
              <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '8px', color: '#0ea5e9' }}>
                <CalendarOutlined style={{ fontSize: '20px' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Máy đang tồn đọng</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#1f2937' }}>27 máy</Title>
                <Tag color="success" icon={<ArrowDownOutlined />} style={{ borderRadius: '10px', color: '#16a34a', background: '#dcfce7', borderColor: '#dcfce7' }}>
                  -4 máy
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>so với hôm qua</Text>
              </div>
              <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
                <InboxOutlined style={{ fontSize: '20px' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Tỷ lệ phải bảo hành lại</Text>
                <Title level={3} style={{ margin: '8px 0', color: '#1f2937' }}>3.8%</Title>
                <Tag color="success" icon={<ArrowDownOutlined />} style={{ borderRadius: '10px', color: '#16a34a', background: '#dcfce7', borderColor: '#dcfce7' }}>
                  -0.6%
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>so với tháng trước</Text>
              </div>
              <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
                <WarningOutlined style={{ fontSize: '20px' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col span={16}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Title level={5} style={{ marginTop: 0 }}>Doanh thu theo tháng</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
              Tách bạch tiền công dịch vụ và doanh thu linh kiện thay thế (đơn vị: triệu đồng)
            </Text>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}tr`} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="service" name="Tiền công dịch vụ" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={15} />
                  <Bar dataKey="parts" name="Bán / thay linh kiện" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            <Title level={5} style={{ marginTop: 0 }}>Năng suất kỹ thuật viên</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
              Số ca hoàn thành trong tháng
            </Text>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart layout="vertical" data={productivityData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="tasks" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={25} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
