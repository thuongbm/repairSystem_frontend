import { Card, Row, Col } from 'antd';
import {
  WalletOutlined,
  CalendarOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';


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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* KPI Stats Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-label">Doanh thu ngày</span>
              <div style={{ color: '#64748b', fontSize: '16px' }}>
                <WalletOutlined />
              </div>
            </div>
            <div className="stat-card-value">18.450.000 ₫</div>
            <div className="stat-card-footer">
              <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUpOutlined style={{ fontSize: '11px' }} /> 12.4%
              </span>
              <span>so với hôm trước</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-label">Doanh thu tháng</span>
              <div style={{ color: '#64748b', fontSize: '16px' }}>
                <CalendarOutlined />
              </div>
            </div>
            <div className="stat-card-value">486.200.000 ₫</div>
            <div className="stat-card-footer">
              <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUpOutlined style={{ fontSize: '11px' }} /> 8.1%
              </span>
              <span>so với kỳ trước</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-label">Thiết bị đang xử lý</span>
              <div style={{ color: '#64748b', fontSize: '16px' }}>
                <InboxOutlined />
              </div>
            </div>
            <div className="stat-card-value">27 máy</div>
            <div className="stat-card-footer">
              <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowDownOutlined style={{ fontSize: '11px' }} /> -4 máy
              </span>
              <span>tồn đọng giảm</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-label">Tỷ lệ bảo hành lại</span>
              <div style={{ color: '#64748b', fontSize: '16px' }}>
                <SafetyCertificateOutlined />
              </div>
            </div>
            <div className="stat-card-value">3.8%</div>
            <div className="stat-card-footer">
              <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ArrowDownOutlined style={{ fontSize: '11px' }} /> -0.6%
              </span>
              <span>dưới ngưỡng mục tiêu 5%</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Biểu đồ doanh thu dịch vụ & linh kiện"
            extra={<span style={{ fontSize: '12px', color: '#64748b' }}>Đơn vị: Triệu VNĐ</span>}
          >
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val}tr`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="service" name="Công dịch vụ" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="parts" name="Linh kiện" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Năng suất kỹ thuật viên"
            extra={<span style={{ fontSize: '12px', color: '#64748b' }}>Tháng này</span>}
          >
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart layout="vertical" data={productivityData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    formatter={(val) => [`${val} ca`, 'Hoàn thành']}
                  />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
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
