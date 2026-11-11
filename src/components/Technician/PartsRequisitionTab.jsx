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

const { Text } = Typography;

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
      message.success(`Đã tạo lệnh xuất kho ${newReq.requestCode}`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const catalogColumns = [
    {
      title: 'Linh kiện',
      key: 'partInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.name}</div>
          <Space size={4} style={{ marginTop: '3px' }}>
            <Tag style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}>
              {record.code}
            </Tag>
            <Tag style={{ fontSize: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
              {record.category}
            </Tag>
          </Space>
        </div>
      ),
    },
    {
      title: 'Thông số kỹ thuật',
      key: 'specs',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#334155' }}>
            <span style={{ color: '#64748b' }}>Bus:</span> {record.busSpec}
          </div>
          <div style={{ fontSize: '12px', marginTop: '2px', color: '#334155' }}>
            <span style={{ color: '#64748b' }}>Chân cắm:</span> <Text code style={{ fontSize: '11px' }}>{record.socketPin}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Tương thích',
      key: 'compatibility',
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {record.compatibleDevices.map((dev) => (
            <Tag key={dev} style={{ fontSize: '11px', margin: 0, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
              {dev}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Tồn kho & Giá',
      key: 'stock',
      render: (_, record) => (
        <div>
          <div>
            <Badge 
              status={record.stock > 5 ? 'success' : 'warning'} 
              text={<span style={{ fontWeight: 500, fontSize: '13px', color: '#0f172a' }}>{record.stock} chiếc</span>} 
            />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {record.location}
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
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
          Xuất kho
        </Button>
      ),
    },
  ];

  const requisitionColumns = [
    {
      title: 'Mã lệnh',
      dataIndex: 'requestCode',
      key: 'requestCode',
      render: (text) => <Text strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{text}</Text>,
    },
    {
      title: 'Phiếu sửa chữa',
      key: 'job',
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ fontWeight: 600 }}>{record.repairJobCode}</Tag>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{record.device}</div>
        </div>
      ),
    },
    {
      title: 'Linh kiện & Số lượng',
      key: 'part',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#0f172a' }}>{record.partName}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Mã: <Text code style={{ fontSize: '11px' }}>{record.partCode}</Text> • Số lượng: <Text strong style={{ color: '#0f172a' }}>{record.quantity}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Mục đích & Thời gian',
      key: 'time',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', color: '#334155' }}>{record.purpose}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ClockCircleOutlined />
            {record.requestDate}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        if (status === 'Đã xuất kho') {
          return (
            <div>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Đã xuất kho
              </Tag>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Thủ kho: {record.warehouseKeeper}</div>
            </div>
          );
        }
        return (
          <div>
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Chờ duyệt
            </Tag>
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
            label: `Danh mục linh kiện (${COMPATIBLE_PARTS_CATALOG.length})`,
            children: (
              <Card bordered={false} style={{ borderRadius: '8px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} sm={16}>
                      <Space wrap style={{ width: '100%' }}>
                        <Input
                          placeholder="Tìm theo mã, bus RAM, socket, chuẩn cáp..."
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                          style={{ width: 300, borderRadius: '6px' }}
                        />
                        <Select
                          value={categoryFilter}
                          onChange={setCategoryFilter}
                          style={{ width: 180 }}
                          options={categories.map((c) => ({
                            value: c,
                            label: c === 'ALL' ? 'Tất cả loại linh kiện' : c,
                          }))}
                        />
                      </Space>
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
              <span>
                <InboxOutlined /> Lệnh xuất kho ({requisitions.length})
              </span>
            ),
            children: (
              <Card bordered={false} style={{ borderRadius: '8px' }}>
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
              <ShoppingCartOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
                Yêu cầu xuất linh kiện
              </div>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateRequisition}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={560}
      >
        {selectedPart && (
          <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
            <Card size="small" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                {selectedPart.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Mã: <Text code>{selectedPart.code}</Text> • Chuẩn: {selectedPart.busSpec} ({selectedPart.socketPin})
              </div>
              <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px', fontWeight: 500 }}>
                Tồn kho: {selectedPart.stock} chiếc tại {selectedPart.location}
              </div>
            </Card>

            <Form.Item
              name="jobKey"
              label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Phiếu sửa chữa</span>}
              rules={[{ required: true, message: 'Vui lòng chọn ca máy' }]}
            >
              <Select
                placeholder="Chọn ca máy cần lĩnh vật tư"
                options={jobs.map((job) => ({
                  value: job.key,
                  label: `[${job.code}] ${job.device} — ${job.customer}`,
                }))}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Số lượng</span>}
                  rules={[{ required: true, message: 'Nhập số lượng' }]}
                >
                  <InputNumber min={1} max={selectedPart.stock || 5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="partCode"
                  label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Mã SKU</span>}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="purpose"
              label={<span style={{ fontWeight: 500, fontSize: '13px' }}>Mục đích sử dụng</span>}
              rules={[{ required: true, message: 'Nhập lý do sử dụng' }]}
            >
              <Input.TextArea rows={2} placeholder="Mô tả lý do thay thế linh kiện..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PartsRequisitionTab;