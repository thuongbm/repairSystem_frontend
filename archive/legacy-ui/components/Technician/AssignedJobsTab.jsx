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
  Steps, 
  Radio, 
  Dropdown, 
  message, 
  Modal, 
  Tooltip, 
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  AppstoreOutlined, 
  BarsOutlined, 
  ToolOutlined, 
  ClockCircleOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  RightOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  DownOutlined
} from '@ant-design/icons';
import { STATUS_STEPS } from './mockData';

const { Text } = Typography;

const getStatusColor = (status) => {
  switch (status) {
    case 'Bắt đầu nhận máy':
      return { tag: 'default' };
    case 'Đang kiểm tra':
      return { tag: 'processing' };
    case 'Đang sửa chữa':
      return { tag: 'blue' };
    case 'Chờ linh kiện':
      return { tag: 'warning' };
    case 'Chờ duyệt phát sinh':
      return { tag: 'orange' };
    case 'Hoàn thành':
      return { tag: 'success' };
    case 'Đã trả máy':
      return { tag: 'cyan' };
    default:
      return { tag: 'default' };
  }
};

const getStepCurrent = (status) => {
  switch (status) {
    case 'Bắt đầu nhận máy':
      return 0;
    case 'Đang kiểm tra':
      return 1;
    case 'Đang sửa chữa':
    case 'Chờ linh kiện':
    case 'Chờ duyệt phát sinh':
      return 2;
    case 'Hoàn thành':
      return 3;
    case 'Đã trả máy':
      return 4;
    default:
      return 0;
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Mobile/Tablet friendly) | 'table' (PC)
  const [detailModalJob, setDetailModalJob] = useState(null);

  // Filter jobs
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

  const nextStatusMap = {
    'Bắt đầu nhận máy': 'Đang kiểm tra',
    'Đang kiểm tra': 'Đang sửa chữa',
    'Đang sửa chữa': 'Hoàn thành',
    'Chờ linh kiện': 'Đang sửa chữa',
    'Chờ duyệt phát sinh': 'Đang sửa chữa',
    'Hoàn thành': 'Đã trả máy',
    'Đã trả máy': 'Đã trả máy',
  };

  const handleNextStep = (job) => {
    const next = nextStatusMap[job.status];
    if (next && next !== job.status) {
      onUpdateJobStatus(job.key, next);
      message.success(`Ca máy ${job.code} đã chuyển trạng thái: ${next}`);
    } else {
      message.info(`Ca máy ${job.code} đã ở trạng thái kết thúc.`);
    }
  };

  const statusMenuItems = () => [
    { key: 'Bắt đầu nhận máy', label: 'Bắt đầu nhận máy' },
    { key: 'Đang kiểm tra', label: 'Đang kiểm tra (Chẩn đoán)' },
    { key: 'Đang sửa chữa', label: 'Đang sửa chữa (Thao tác phần cứng)' },
    { key: 'Chờ linh kiện', label: 'Chờ linh kiện (Đã tạo phiếu kho)' },
    { key: 'Chờ duyệt phát sinh', label: 'Chờ duyệt phát sinh (Gửi lễ tân)' },
    { key: 'Hoàn thành', label: 'Hoàn thành (Test QC xong)' },
    { key: 'Đã trả máy', label: 'Đã trả máy (Bàn giao khách)' },
  ];

  const handleStatusMenuClick = (job, e) => {
    onUpdateJobStatus(job.key, e.key);
    message.success(`Đã cập nhật trạng thái ${job.code} thành: ${e.key}`);
  };

  // Table Columns for PC view
  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontFamily: 'monospace', color: '#1677ff', fontSize: '14px' }}>
            {text}
          </Text>
          {record.priority === 'Khẩn cấp' && (
            <div>
              <Tag color="error" style={{ fontSize: '10px', padding: '0 4px', margin: '2px 0 0 0' }}>
                GẤP
              </Tag>
            </div>
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
      title: 'Thiết bị & Lỗi khai báo',
      key: 'device',
      render: (_, record) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{record.device}</div>
          <div style={{ fontSize: '12px', color: '#595959', marginTop: '2px' }}>
            <Text type="secondary">Khách báo: </Text>
            {record.customerIssue}
          </div>
          {record.actualDiagnosis && (
            <div style={{ marginTop: '4px' }}>
              <Tag color="blue" style={{ fontSize: '11px', margin: '2px' }}>
                ✓ Đã chẩn đoán: {record.actualDiagnosis.tags[0] || 'Lỗi mạch'}
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
      render: (text) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: '4px', color: '#fa8c16' }} />
          <Text style={{ fontSize: '12px', fontWeight: 500 }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const { tag } = getStatusColor(status);
        return (
          <Dropdown
            menu={{
              items: statusMenuItems(record),
              onClick: (e) => handleStatusMenuClick(record, e),
            }}
          >
            <Button size="small" style={{ borderRadius: '12px', fontSize: '12px' }}>
              <Tag color={tag} style={{ border: 'none', margin: 0 }}>{status}</Tag>
              <DownOutlined style={{ fontSize: '10px' }} />
            </Button>
          </Dropdown>
        );
      },
    },
    {
      title: 'Thao tác kỹ thuật',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Ghi chép kết quả chẩn đoán lỗi thực tế với mẫu tích chọn nhanh">
            <Button
              type={record.actualDiagnosis ? 'default' : 'primary'}
              size="small"
              icon={<ToolOutlined />}
              onClick={() => onOpenDiagnosis(record)}
            >
              {record.actualDiagnosis ? 'Sửa chẩn đoán' : 'Chẩn đoán'}
            </Button>
          </Tooltip>

          <Tooltip title="Lĩnh/xuất linh kiện kho gắn với mã phiếu này">
            <Button
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => onOpenRequisition(record)}
            >
              Lĩnh vật tư
            </Button>
          </Tooltip>

          <Tooltip title="Đề xuất lỗi mới / chi phí phát sinh gửi lễ tân gọi khách">
            <Button
              size="small"
              icon={<DollarOutlined />}
              onClick={() => onOpenProposal(record)}
            >
              Báo phát sinh
            </Button>
          </Tooltip>

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
      {/* Control bar */}
      <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Space wrap size="middle">
              <Input
                placeholder="Tìm mã phiếu, khách hàng, số điện thoại, thiết bị..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 280, borderRadius: '6px' }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 170 }}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  ...STATUS_STEPS.map((s) => ({ value: s.title, label: s.title })),
                ]}
              />
              <Select
                value={priorityFilter}
                onChange={setPriorityFilter}
                style={{ width: 130 }}
                options={[
                  { value: 'ALL', label: 'Mọi độ ưu tiên' },
                  { value: 'Khẩn cấp', label: '🔴 Khẩn cấp' },
                  { value: 'Bình thường', label: '⚪ Bình thường' },
                ]}
              />
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Đang hiển thị: <Text strong>{filteredJobs.length}</Text> ca máy
              </Text>
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="grid">
                  <AppstoreOutlined /> <span className="mobile-hide">Thẻ (Mobile/Tablet)</span>
                </Radio.Button>
                <Radio.Button value="table">
                  <BarsOutlined /> <span className="mobile-hide">Bảng (PC)</span>
                </Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid View (Touch-friendly for Mobile / Tablet) */}
      {viewMode === 'grid' ? (
        <Row gutter={[16, 16]}>
          {filteredJobs.map((job) => {
            const { tag } = getStatusColor(job.status);
            const stepCurrent = getStepCurrent(job.status);

            return (
              <Col xs={24} md={12} xl={8} key={job.key}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: job.priority === 'Khẩn cấp' ? '3px solid #ff4d4f' : '3px solid #1677ff',
                  }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontFamily: 'monospace', fontSize: '16px', color: '#1677ff' }}>
                          {job.code}
                        </Text>
                        {job.priority === 'Khẩn cấp' && (
                          <Tag color="red" style={{ margin: 0, fontWeight: 'bold', fontSize: '11px' }}>
                            ⚡ CẦN GẤP
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
                        Nhận: {job.receiveDate} | Hẹn: <span style={{ color: '#d46b08', fontWeight: 600 }}>{job.appointmentDate}</span>
                      </div>
                    </div>

                    <Dropdown
                      menu={{
                        items: statusMenuItems(job),
                        onClick: (e) => handleStatusMenuClick(job, e),
                      }}
                      trigger={['click']}
                    >
                      <Button size="small" style={{ borderRadius: '12px', height: '26px' }}>
                        <Tag color={tag} style={{ border: 'none', margin: 0 }}>{job.status}</Tag>
                        <DownOutlined style={{ fontSize: '10px' }} />
                      </Button>
                    </Dropdown>
                  </div>

                  {/* Device & Customer */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937' }}>
                      {job.device}
                    </div>
                    <div style={{ fontSize: '12px', color: '#595959', marginTop: '2px' }}>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      <Text strong>{job.customer}</Text> • <PhoneOutlined style={{ marginLeft: '4px', marginRight: '4px' }} />
                      <a href={`tel:${job.phone}`}>{job.phone}</a>
                    </div>
                  </div>

                  {/* Customer Initial Issue */}
                  <div style={{ background: '#f5f5f5', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 600, textTransform: 'uppercase' }}>
                      Khai báo ban đầu của khách:
                    </div>
                    <div style={{ color: '#262626', marginTop: '2px', fontStyle: 'italic' }}>
                      "{job.customerIssue}"
                    </div>
                  </div>

                  {/* Actual Diagnosis snippet */}
                  {job.actualDiagnosis ? (
                    <div style={{ background: '#e6f4ff', border: '1px solid #91caff', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#0958d9', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>✓ KẾT QUẢ CHẨN ĐOÁN THỰC TẾ:</span>
                        <span>{job.actualDiagnosis.diagnosedAt}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
                        {job.actualDiagnosis.tags.map((t) => (
                          <Tag key={t} color="blue" style={{ fontSize: '11px', margin: 0 }}>
                            {t}
                          </Tag>
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#262626' }}>
                        {job.actualDiagnosis.notes}
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: '1px dashed #d9d9d9', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Chưa ghi nhận chẩn đoán lỗi phần cứng thực tế
                      </Text>
                    </div>
                  )}

                  {/* Steps Progress Mini */}
                  <div style={{ marginBottom: '14px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#8c8c8c' }}>Tiến trình sửa chữa:</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<RightOutlined />}
                        style={{ padding: 0, fontSize: '12px' }}
                        onClick={() => handleNextStep(job)}
                      >
                        Bước tiếp: {nextStatusMap[job.status] || 'Xong'}
                      </Button>
                    </div>
                    <Steps
                      size="small"
                      current={stepCurrent}
                      items={[
                        { title: 'Nhận máy' },
                        { title: 'Kiểm tra' },
                        { title: 'Sửa chữa' },
                        { title: 'Hoàn thành' },
                      ]}
                    />
                  </div>

                  {/* Touch Action Buttons for Mobile/Tablet */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Button
                      type={job.actualDiagnosis ? 'default' : 'primary'}
                      icon={<ToolOutlined />}
                      style={{ borderRadius: '6px', height: '36px' }}
                      onClick={() => onOpenDiagnosis(job)}
                    >
                      {job.actualDiagnosis ? 'Sửa chẩn đoán' : 'Ghi chẩn đoán'}
                    </Button>

                    <Button
                      icon={<ShoppingCartOutlined />}
                      style={{ borderRadius: '6px', height: '36px' }}
                      onClick={() => onOpenRequisition(job)}
                    >
                      Lĩnh vật tư
                    </Button>

                    <Button
                      icon={<DollarOutlined />}
                      style={{ borderRadius: '6px', height: '36px' }}
                      onClick={() => onOpenProposal(job)}
                    >
                      Báo phát sinh
                    </Button>

                    <Button
                      type="dashed"
                      icon={<EyeOutlined />}
                      style={{ borderRadius: '6px', height: '36px' }}
                      onClick={() => setDetailModalJob(job)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Card bordered={false} style={{ borderRadius: '12px' }}>
          <Table
            columns={columns}
            dataSource={filteredJobs}
            rowKey="key"
            pagination={{ pageSize: 8 }}
            scroll={{ x: 900 }}
          />
        </Card>
      )}

      {/* Modal Chi tiết ca máy */}
      {detailModalJob && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ToolOutlined style={{ color: '#1677ff' }} />
              <span>Hồ sơ chi tiết ca máy — {detailModalJob.code}</span>
            </div>
          }
          open={Boolean(detailModalJob)}
          onCancel={() => setDetailModalJob(null)}
          footer={[
            <Button key="close" onClick={() => setDetailModalJob(null)}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <Card size="small" style={{ background: '#fafafa' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div><Text type="secondary">Mã ca máy:</Text> <Text strong>{detailModalJob.code}</Text></div>
                  <div><Text type="secondary">Khách hàng:</Text> <Text strong>{detailModalJob.customer}</Text></div>
                  <div><Text type="secondary">Số điện thoại:</Text> <Text strong>{detailModalJob.phone}</Text></div>
                </Col>
                <Col span={12}>
                  <div><Text type="secondary">Thiết bị:</Text> <Text strong>{detailModalJob.device}</Text></div>
                  <div><Text type="secondary">Serial/IMEI:</Text> <Text code>{detailModalJob.deviceSerial || 'Chưa có'}</Text></div>
                  <div><Text type="secondary">Kỹ thuật viên:</Text> <Text strong>{detailModalJob.assignedTech}</Text></div>
                </Col>
              </Row>
            </Card>

            <div>
              <Text strong>Khai báo ban đầu của khách hàng:</Text>
              <div style={{ background: '#fffbe6', padding: '10px', borderRadius: '6px', marginTop: '4px', border: '1px solid #ffe58f' }}>
                {detailModalJob.customerIssue}
              </div>
            </div>

            {detailModalJob.actualDiagnosis ? (
              <div>
                <Text strong>Kết luận chẩn đoán thực tế của thợ:</Text>
                <div style={{ background: '#f0f5ff', padding: '10px', borderRadius: '6px', marginTop: '4px', border: '1px solid #adc6ff' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                    {detailModalJob.actualDiagnosis.tags.map((t) => (
                      <Tag key={t} color="blue">{t}</Tag>
                    ))}
                  </div>
                  <div style={{ fontSize: '13px' }}>{detailModalJob.actualDiagnosis.notes}</div>
                  {detailModalJob.actualDiagnosis.measurements && (
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '6px' }}>
                      ⚡ Đo đạc: {detailModalJob.actualDiagnosis.measurements}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Alert type="warning" message="Chưa thực hiện chẩn đoán thực tế cho ca máy này." />
            )}

            {detailModalJob.spareParts && detailModalJob.spareParts.length > 0 && (
              <div>
                <Text strong>Linh kiện đã yêu cầu lĩnh kho:</Text>
                <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                  {detailModalJob.spareParts.map((p) => (
                    <li key={p.id}>
                      {p.name} (Mã: {p.code}) — Số lượng: {p.qty} — <Tag color="green">{p.status}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailModalJob.proposals && detailModalJob.proposals.length > 0 && (
              <div>
                <Text strong>Hạng mục báo giá phát sinh:</Text>
                <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>
                  {detailModalJob.proposals.map((p) => (
                    <li key={p.id}>
                      {p.title} — Chi phí: {((p.partCost || 0) + (p.laborCost || 0)).toLocaleString('vi-VN')} ₫ — <Tag color="blue">{p.status}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssignedJobsTab;
