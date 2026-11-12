import { useState } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Radio,
  Dropdown,
  message,
  Modal
} from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
  PhoneOutlined,
  DownOutlined
} from '@ant-design/icons';
import { STATUS_STEPS } from './mockData';

const { Text } = Typography;

const getStatusBadge = (status) => {
  switch (status) {
    case 'Bắt đầu nhận máy':
      return <Tag color="default">{status}</Tag>;
    case 'Đang kiểm tra':
      return <Tag color="processing">{status}</Tag>;
    case 'Đang sửa chữa':
      return <Tag color="blue">{status}</Tag>;
    case 'Chờ linh kiện':
      return <Tag color="warning">{status}</Tag>;
    case 'Chờ duyệt phát sinh':
      return <Tag color="volcano">{status}</Tag>;
    case 'Hoàn thành':
      return <Tag color="success">{status}</Tag>;
    case 'Đã trả máy':
      return <Tag color="purple">{status}</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const AssignedJobsTab = ({
  jobs,
  onUpdateJobStatus,
  onOpenDiagnosis,
  onOpenProposal,
  onOpenRequisition
}) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [detailModalJob, setDetailModalJob] = useState(null);

  const filteredJobs = jobs.filter((job) => {
    const query = searchText.toLowerCase();
    const matchSearch =
      job.code.toLowerCase().includes(query) ||
      job.customer.toLowerCase().includes(query) ||
      job.device.toLowerCase().includes(query) ||
      job.phone.includes(query);

    const matchStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || job.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const statusMenuItems = () => [
    { key: 'Bắt đầu nhận máy', label: 'Bắt đầu nhận máy' },
    { key: 'Đang kiểm tra', label: 'Đang kiểm tra (Chẩn đoán)' },
    { key: 'Đang sửa chữa', label: 'Đang sửa chữa' },
    { key: 'Chờ linh kiện', label: 'Chờ linh kiện' },
    { key: 'Chờ duyệt phát sinh', label: 'Chờ duyệt phát sinh' },
    { key: 'Hoàn thành', label: 'Hoàn thành' },
    { key: 'Đã trả máy', label: 'Đã trả máy' },
  ];

  const handleStatusMenuClick = (job, e) => {
    onUpdateJobStatus(job.key, e.key);
    message.success(`Đã cập nhật ${job.code} -> ${e.key}`);
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{text}</Text>
          {record.priority === 'Khẩn cấp' && (
            <Tag color="error" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>GẤP</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.customer}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Thiết bị & Tình trạng',
      key: 'device',
      render: (_, record) => (
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.device}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
            {record.customerIssue}
          </div>
          {record.actualDiagnosis && (
            <div style={{ marginTop: 4 }}>
              <Tag color="blue" style={{ fontSize: '11px' }}>
                {record.actualDiagnosis.tags[0] || 'Đã chẩn đoán'}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Hẹn trả máy',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      width: 150,
      render: (text) => (
        <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500 }}>
          <ClockCircleOutlined style={{ marginRight: 4, color: '#64748b' }} />
          {text}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status, record) => (
        <Dropdown
          menu={{
            items: statusMenuItems(),
            onClick: (e) => handleStatusMenuClick(record, e),
          }}
        >
          <div style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {getStatusBadge(status)}
            <DownOutlined style={{ fontSize: '9px', color: '#94a3b8' }} />
          </div>
        </Dropdown>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space size={6}>
          <Button
            type={record.actualDiagnosis ? 'default' : 'primary'}
            size="small"
            icon={<ToolOutlined />}
            onClick={() => onOpenDiagnosis(record)}
          >
            {record.actualDiagnosis ? 'Sửa' : 'Chẩn đoán'}
          </Button>

          <Button
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => onOpenRequisition(record)}
          >
            Vật tư
          </Button>

          <Button
            size="small"
            icon={<DollarOutlined />}
            onClick={() => onOpenProposal(record)}
          >
            Báo giá
          </Button>

          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setDetailModalJob(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Control Filter Bar */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 14 }}>
        <Row gutter={[12, 12]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Space wrap size="middle">
              <Input
                placeholder="Tìm mã phiếu, khách, model..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  ...STATUS_STEPS.map((s) => ({ value: s.title, label: s.title })),
                ]}
              />
              <Select
                value={priorityFilter}
                onChange={setPriorityFilter}
                style={{ width: 140 }}
                options={[
                  { value: 'ALL', label: 'Mọi độ ưu tiên' },
                  { value: 'Khẩn cấp', label: 'Khẩn cấp' },
                  { value: 'Bình thường', label: 'Bình thường' },
                ]}
              />
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>
                Tổng: <strong style={{ color: '#0f172a' }}>{filteredJobs.length}</strong>
              </Text>
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                size="small"
              >
                <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
                <Radio.Button value="table"><BarsOutlined /></Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <Row gutter={[14, 14]}>
          {filteredJobs.map((job) => (
            <Col xs={24} md={12} xl={8} key={job.key}>
              <Card
                bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}
                style={{ height: '100%', border: job.priority === 'Khẩn cấp' ? '1px solid #fecaca' : '1px solid #e2e8f0' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Text strong style={{ fontFamily: 'monospace', fontSize: '15px', color: '#2563eb' }}>
                        {job.code}
                      </Text>
                      {job.priority === 'Khẩn cấp' && (
                        <Tag color="error" style={{ margin: 0, fontSize: '10px', padding: '0 4px', fontWeight: 600 }}>
                          GẤP
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                      Nhận: {job.receiveDate} • Hẹn: <span style={{ fontWeight: 600, color: '#0f172a' }}>{job.appointmentDate}</span>
                    </div>
                  </div>

                  <Dropdown
                    menu={{
                      items: statusMenuItems(),
                      onClick: (e) => handleStatusMenuClick(job, e),
                    }}
                    trigger={['click']}
                  >
                    <div style={{ cursor: 'pointer' }}>
                      {getStatusBadge(job.status)}
                    </div>
                  </Dropdown>
                </div>

                {/* Device & Customer */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    {job.device}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                    <span>{job.customer}</span> • <a href={`tel:${job.phone}`} style={{ color: '#2563eb' }}>{job.phone}</a>
                  </div>
                </div>

                {/* Issue summary */}
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', color: '#334155', border: '1px solid #f1f5f9' }}>
                  {job.customerIssue}
                </div>

                {/* Diagnosis note if present */}
                {job.actualDiagnosis && (
                  <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #dbeafe' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {job.actualDiagnosis.tags.map((t) => (
                        <Tag key={t} color="blue" style={{ fontSize: '10px', margin: 0 }}>
                          {t}
                        </Tag>
                      ))}
                    </div>
                    <div style={{ color: '#1e3a8a', fontSize: '11px' }}>
                      {job.actualDiagnosis.notes}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, paddingTop: 6 }}>
                  <Button
                    type={job.actualDiagnosis ? 'default' : 'primary'}
                    size="small"
                    icon={<ToolOutlined />}
                    onClick={() => onOpenDiagnosis(job)}
                  >
                    {job.actualDiagnosis ? 'Sửa' : 'Chẩn đoán'}
                  </Button>

                  <Button
                    size="small"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => onOpenRequisition(job)}
                  >
                    Vật tư
                  </Button>

                  <Button
                    size="small"
                    icon={<DollarOutlined />}
                    onClick={() => onOpenProposal(job)}
                  >
                    Báo giá
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredJobs}
            rowKey="key"
            pagination={{ pageSize: 8 }}
            scroll={{ x: 900 }}
          />
        </Card>
      )}

      {/* Detail Modal */}
      {detailModalJob && (
        <Modal
          title={`Hồ sơ thiết bị — ${detailModalJob.code}`}
          open={Boolean(detailModalJob)}
          onCancel={() => setDetailModalJob(null)}
          footer={[
            <Button key="close" onClick={() => setDetailModalJob(null)}>
              Đóng
            </Button>,
          ]}
          width={640}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '13px' }}>
              <Row gutter={[12, 6]}>
                <Col span={12}><div><Text type="secondary">Khách hàng:</Text> <strong>{detailModalJob.customer}</strong></div></Col>
                <Col span={12}><div><Text type="secondary">Số điện thoại:</Text> <strong>{detailModalJob.phone}</strong></div></Col>
                <Col span={12}><div><Text type="secondary">Thiết bị:</Text> <strong>{detailModalJob.device}</strong></div></Col>
                <Col span={12}><div><Text type="secondary">Serial/IMEI:</Text> <Text code>{detailModalJob.deviceSerial || '—'}</Text></div></Col>
              </Row>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                Khai báo lỗi ban đầu
              </div>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '13px' }}>
                {detailModalJob.customerIssue}
              </div>
            </div>

            {detailModalJob.actualDiagnosis && (
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px', color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                  Kết quả chẩn đoán kỹ thuật
                </div>
                <div style={{ background: '#eff6ff', padding: 10, borderRadius: 6, border: '1px solid #bfdbfe', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    {detailModalJob.actualDiagnosis.tags.map((t) => (
                      <Tag key={t} color="blue">{t}</Tag>
                    ))}
                  </div>
                  <div>{detailModalJob.actualDiagnosis.notes}</div>
                  {detailModalJob.actualDiagnosis.measurements && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                      Đo đạc: {detailModalJob.actualDiagnosis.measurements}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssignedJobsTab;
