import { useState } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Select, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Badge,
  Tabs
} from 'antd';
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  InboxOutlined, 
  ClockCircleOutlined
} from '@ant-design/icons';
import { COMPATIBLE_PARTS_CATALOG } from './mockData';

const { Title, Text } = Typography;

const PartsRequisitionTab = ({ jobs, requisitions, onAddRequisition }) => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [form] = Form.useForm();

  // Filter parts catalog
  const filteredCatalog = COMPATIBLE_PARTS_CATALOG.filter((part) => {
    const matchSearch =
      part.name.toLowerCase().includes(searchText.toLowerCase()) ||
      part.code.toLowerCase().includes(searchText.toLowerCase()) ||
      part.busSpec.toLowerCase().includes(searchText.toLowerCase()) ||
      part.socketPin.toLowerCase().includes(searchText.toLowerCase());

    const matchCategory =
      categoryFilter === 'ALL' || part.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  const categories = [
    'ALL',
    ...Array.from(new Set(COMPATIBLE_PARTS_CATALOG.map((p) => p.category))),
  ];

  const handleOpenRequisitionModal = (part) => {
    setSelectedPart(part);
    form.resetFields();
    form.setFieldsValue({
      partCode: part.code,
      partName: part.name,
      quantity: 1,
      purpose: `Thay thế linh kiện cho máy`,
      jobKey: jobs[0]?.key,
    });
    setIsModalOpen(true);
  };

  const handleCreateRequisition = async () => {
    try {
      const values = await form.validateFields();
      const targetJob = jobs.find((j) => j.key === values.jobKey);

      const newReq = {
        key: `${Date.now()}`,
        requestCode: `XK-${Math.floor(8800 + Math.random() * 1100)}`,
        repairJobCode: targetJob ? targetJob.code : 'PN-TỰ-DO',
        device: targetJob ? targetJob.device : 'Chưa định danh',
        partName: values.partName,
        partCode: values.partCode,
        quantity: values.quantity,
        requestDate: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        purpose: values.purpose,
        status: 'Chờ thủ kho duyệt',
        warehouseKeeper: 'Đang tiếp nhận',
      };

      onAddRequisition(newReq);
      message.success(`Đã tạo lệnh xuất kho ${newReq.requestCode} gắn liền phiếu ${newReq.repairJobCode}!`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const catalogColumns = [
    {
      title: 'Mã & Tên linh kiện',
      key: 'partInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{record.name}</div>
          <Space orientation="horizontal" size={4} style={{ marginTop: '4px' }}>
            <Tag color="geekblue" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {record.code}
            </Tag>
            <Tag color="cyan">{record.category}</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: 'Thông số kỹ thuật chuẩn (Bus / Pinout / Socket)',
      key: 'specs',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px' }}>
            <Text strong>Tốc độ/Bus: </Text>
            <Text type="secondary">{record.busSpec}</Text>
          </div>
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            <Text strong>Chân cắm: </Text>
            <Text code>{record.socketPin}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Độ tương thích mẫu máy',
      key: 'compatibility',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {record.compatibleDevices.map((dev) => (
              <Tag key={dev} style={{ fontSize: '11px', margin: 0, background: '#f5f5f5' }}>
                {dev}
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho & Vị trí',
      key: 'stock',
      render: (_, record) => (
        <div>
          <div>
            <Badge 
              status={record.stock > 5 ? 'success' : 'warning'} 
              text={<Text strong>{record.stock} chiếc khả dụng</Text>} 
            />
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
            📍 {record.location}
          </div>
          <div style={{ fontSize: '12px', color: '#0958d9', fontWeight: 500, marginTop: '2px' }}>
            {record.unitPrice.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingCartOutlined />}
          style={{ borderRadius: '6px' }}
          onClick={() => handleOpenRequisitionModal(record)}
        >
          Yêu cầu xuất kho
        </Button>
      ),
    },
  ];

  const requisitionColumns = [
    {
      title: 'Mã lệnh XK',
      dataIndex: 'requestCode',
      key: 'requestCode',
      render: (text) => <Text strong style={{ fontFamily: 'monospace', color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: 'Phiếu sửa chữa gắn kết',
      key: 'job',
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ fontWeight: 'bold' }}>{record.repairJobCode}</Tag>
          <div style={{ fontSize: '12px', color: '#595959', marginTop: '2px' }}>{record.device}</div>
        </div>
      ),
    },
    {
      title: 'Linh kiện & Số lượng',
      key: 'part',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.partName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Mã: <Text code>{record.partCode}</Text> | Số lượng: <Text strong style={{ color: '#cf1322' }}>x{record.quantity}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Mục đích & Thời gian',
      key: 'time',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>{record.purpose}</div>
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            {record.requestDate}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái Kho',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        if (status === 'Đã xuất kho') {
          return (
            <div>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Đã xuất kho
              </Tag>
              <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Thủ kho: {record.warehouseKeeper}</div>
            </div>
          );
        }
        return (
          <div>
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Chờ kho duyệt xuất
            </Tag>
            <div style={{ fontSize: '11px', color: '#fa8c16' }}>Đang chờ thủ kho soạn hàng</div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="catalog"
        items={[
          {
            key: 'catalog',
            label: (
              <span style={{ fontWeight: '500' }}>
                <SearchOutlined /> Tra cứu mã linh kiện tương thích ({COMPATIBLE_PARTS_CATALOG.length})
              </span>
            ),
            children: (
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} sm={14}>
                      <Space wrap style={{ width: '100%' }}>
                        <Input
                          placeholder="Tra cứu theo mã, bus RAM, socket, chuẩn cáp..."
                          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                          style={{ width: 320, borderRadius: '6px' }}
                        />
                        <Select
                          value={categoryFilter}
                          onChange={setCategoryFilter}
                          style={{ width: 170 }}
                          options={categories.map((c) => ({
                            value: c,
                            label: c === 'ALL' ? 'Tất cả loại linh kiện' : c,
                          }))}
                        />
                      </Space>
                    </Col>
                    <Col xs={24} sm={10} style={{ textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Tự động hiển thị chuẩn chân cắm & tồn kho thực tế tại kho xưởng
                      </Text>
                    </Col>
                  </Row>
                </div>

                <Table
                  columns={catalogColumns}
                  dataSource={filteredCatalog}
                  rowKey="code"
                  pagination={{ pageSize: 6 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
          {
            key: 'requisitions',
            label: (
              <span style={{ fontWeight: '500' }}>
                <InboxOutlined /> Lệnh xuất kho đã gửi ({requisitions.length})
              </span>
            ),
            children: (
              <Card bordered={false} style={{ borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>Lịch sử lệnh yêu cầu xuất vật tư</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Tất cả các linh kiện xuất đều bắt buộc gắn chặt với Mã phiếu sửa chữa của ca máy phụ trách.
                    </Text>
                  </div>
                </div>

                <Table
                  columns={requisitionColumns}
                  dataSource={requisitions}
                  rowKey="requestCode"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 750 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Modal tạo lệnh xuất kho */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCartOutlined style={{ color: '#1677ff', fontSize: '20px' }} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                Tạo lệnh yêu cầu xuất linh kiện trực tuyến
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 'normal' }}>
                Gắn liền Mã phiếu sửa chữa gửi sang bộ phận Quản lý kho
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateRequisition}
        okText="Gửi lệnh sang bộ phận Kho"
        cancelText="Hủy"
        width={620}
      >
        {selectedPart && (
          <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
            <Card size="small" style={{ background: '#f0f5ff', borderColor: '#adc6ff', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, color: '#0958d9', fontSize: '14px' }}>
                {selectedPart.name}
              </div>
              <div style={{ fontSize: '12px', color: '#595959', marginTop: '4px' }}>
                Mã: <Text code>{selectedPart.code}</Text> | Chuẩn: {selectedPart.busSpec} ({selectedPart.socketPin})
              </div>
              <div style={{ fontSize: '12px', color: '#389e0d', marginTop: '2px', fontWeight: 500 }}>
                Tồn kho: {selectedPart.stock} chiếc tại {selectedPart.location}
              </div>
            </Card>

            <Form.Item
              name="jobKey"
              label={<span style={{ fontWeight: 600 }}>Bắt buộc gắn với Mã phiếu sửa chữa của ca máy:</span>}
              rules={[{ required: true, message: 'Vui lòng chọn ca máy cần lĩnh vật tư!' }]}
            >
              <Select
                placeholder="Chọn ca máy đang phụ trách"
                options={jobs.map((job) => ({
                  value: job.key,
                  label: `[${job.code}] - ${job.device} (${job.customer})`,
                }))}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label={<span style={{ fontWeight: 600 }}>Số lượng yêu cầu:</span>}
                  rules={[{ required: true, message: 'Nhập số lượng' }]}
                >
                  <InputNumber min={1} max={selectedPart.stock || 5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="partCode"
                  label={<span style={{ fontWeight: 600 }}>Mã linh kiện SKU:</span>}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="purpose"
              label={<span style={{ fontWeight: 600 }}>Lý do / Mục đích xuất linh kiện:</span>}
              rules={[{ required: true, message: 'Nhập lý do sử dụng' }]}
            >
              <Input.TextArea rows={2} placeholder="VD: Thay thế tụ bị chập rò mass trên bo mạch nguồn 19V..." />
            </Form.Item>

            <div style={{ fontSize: '12px', color: '#8c8c8c', background: '#fafafa', padding: '8px 12px', borderRadius: '6px' }}>
              🔒 Quy chế xưởng: Sau khi gửi, thủ kho sẽ kiểm tra mã phiếu và xuất vật tư ngay tại cửa giao nhận B2.
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PartsRequisitionTab;
