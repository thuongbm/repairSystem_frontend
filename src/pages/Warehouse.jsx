import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Input, Tag, Space, Modal, Form, Select, DatePicker, message, Badge } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  ImportOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const Warehouse = () => {
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [form] = Form.useForm();

  // --- State Dữ liệu giả lập ---

  // 1. Danh mục linh kiện
  const [inventoryData, setInventoryData] = useState([
    { key: '1', code: 'RAM-8GB-D4', name: 'RAM DDR4 8GB Bus 3200', unit: 'Thanh', costPrice: 350000, price: 550000, location: 'Kệ A1', specs: 'DDR4, 3200MHz, Laptop', stock: 5, minStock: 10 },
    { key: '2', code: 'SSD-512-NVME', name: 'Ổ cứng SSD 512GB NVMe PCIe', unit: 'Ổ', costPrice: 650000, price: 950000, location: 'Kệ A2', specs: 'M.2 NVMe, Gen3x4', stock: 15, minStock: 5 },
    { key: '3', code: 'VGA-RTX3060', name: 'Card màn hình RTX 3060 6GB', unit: 'Cái', costPrice: 5500000, price: 6800000, location: 'Tủ B', specs: 'GDDR6, 192-bit', stock: 2, minStock: 2 },
    { key: '4', code: 'KEO-MX4', name: 'Keo tản nhiệt Arctic MX-4 (4g)', unit: 'Tuýp', costPrice: 120000, price: 180000, location: 'Tủ Vật Tư', specs: '4g, Độ dẫn nhiệt 8.5 W/mK', stock: 3, minStock: 5 },
    { key: '5', code: 'PIN-DELL-5490', name: 'Pin Laptop Dell Latitude 5490', unit: 'Viên', costPrice: 600000, price: 900000, location: 'Kệ C1', specs: '68Wh, 4 cell', stock: 0, minStock: 3 },
  ]);

  // 2. Lịch sử nhập kho
  const [importHistory, setImportHistory] = useState([
    { key: '1', code: 'PN-20231025-01', date: '25/10/2023', supplier: 'Công ty TNHH TLC', totalAmount: 15000000, status: 'Hoàn thành' },
    { key: '2', code: 'PN-20231020-02', date: '20/10/2023', supplier: 'Mai Hoàng PC', totalAmount: 8500000, status: 'Hoàn thành' },
  ]);

  // 3. Phê duyệt xuất kho (từ KTV)
  const [exportRequests, setExportRequests] = useState([
    { key: '1', ticketCode: 'TN-20231027-01', ktv: 'Tuấn Anh', partName: 'Ổ cứng SSD 512GB NVMe PCIe', quantity: 1, reqDate: '27/10/2023 14:30', status: 'pending' },
    { key: '2', ticketCode: 'TN-20231027-04', ktv: 'Văn Hùng', partName: 'Keo tản nhiệt Arctic MX-4 (4g)', quantity: 1, reqDate: '27/10/2023 15:10', status: 'pending', note: 'Xin cấp phát mới đợt này' },
    { key: '3', ticketCode: 'TN-20231026-12', ktv: 'Quốc Bảo', partName: 'RAM DDR4 8GB Bus 3200', quantity: 1, reqDate: '26/10/2023 09:15', status: 'approved' },
  ]);

  // 4. Hàng bảo hành
  const [warrantyData, setWarrantyData] = useState([
    { key: '1', partName: 'Card màn hình RTX 3060 6GB', serial: 'SN30609823', error: 'Chập cháy mảng nguồn', supplier: 'Mai Hoàng PC', sendDate: '20/10/2023', status: 'Đang xử lý tại hãng' },
    { key: '2', partName: 'Ổ cứng SSD 512GB NVMe PCIe', serial: 'SNSSD512999', error: 'Không nhận ổ', supplier: 'Công ty TNHH TLC', sendDate: '15/10/2023', status: 'Đã đổi trả mới' },
  ]);

  // --- State lọc dữ liệu ---
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // --- Xử lý sự kiện ---
  const handleApprove = (key) => {
    const req = exportRequests.find(r => r.key === key);
    if (!req) return;

    const invItem = inventoryData.find(i => i.name === req.partName);
    if (!invItem) {
        message.error('Lỗi: Không tìm thấy linh kiện trong kho!');
        return;
    }

    if (invItem.stock < req.quantity) {
        message.error(`Lỗi: Không đủ số lượng tồn kho để duyệt (Chỉ còn ${invItem.stock} ${invItem.unit})!`);
        return;
    }

    // Trừ tồn kho
    setInventoryData(prev => prev.map(item => 
        item.key === invItem.key ? { ...item, stock: item.stock - req.quantity } : item
    ));

    // Đổi trạng thái xuất
    setExportRequests(prev => prev.map(item => item.key === key ? { ...item, status: 'approved' } : item));
    message.success('Đã duyệt phiếu xuất kho và trừ tồn kho thành công!');
  };

  const handleReject = (key) => {
    setExportRequests(prev => prev.map(item => item.key === key ? { ...item, status: 'rejected' } : item));
    message.error('Đã từ chối phiếu xuất kho.');
  };

  const handleImportSubmit = (values) => {
    const supplierMap = {
      'tlc': 'Công ty TNHH TLC',
      'maihoang': 'Mai Hoàng PC',
      'hanoicomputer': 'HANOICOMPUTER'
    };
    const supplierName = supplierMap[values.supplier] || values.supplier;
    
    const importedPartCode = values.partCode || 'RAM-8GB-D4'; 
    const importedQty = parseInt(values.quantity || 10, 10);
    const importedPrice = parseInt(values.price || 350000, 10);

    const newCode = `PN-20231027-0${importHistory.length + 1}`;
    
    // Cập nhật Lịch sử nhập kho
    setImportHistory(prev => [
      { 
        key: Date.now().toString(), 
        code: newCode, 
        date: values.date ? values.date.format('DD/MM/YYYY') : '27/10/2023', 
        supplier: supplierName, 
        totalAmount: importedQty * importedPrice, 
        status: 'Hoàn thành' 
      },
      ...prev
    ]);

    // Cộng Tồn kho
    setInventoryData(prev => prev.map(item => 
      item.code === importedPartCode ? { ...item, stock: item.stock + importedQty } : item
    ));

    message.success(`Đã tạo phiếu nhập kho ${newCode} và cộng dồn tồn kho!`);
    setIsImportModalVisible(false);
    form.resetFields();
  };

  // --- Cấu hình Cột bảng (Columns) ---

  const inventoryColumns = [
    { title: 'Mã LK', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên linh kiện / Vật tư', dataIndex: 'name', key: 'name' },
    { title: 'Vị trí', dataIndex: 'location', key: 'location', width: 100 },
    { title: 'Giá vốn', dataIndex: 'costPrice', key: 'costPrice', render: (val) => `${val.toLocaleString()} đ` },
    { title: 'Tồn kho', key: 'stock', render: (_, record) => {
        let color = 'green';
        let icon = null;
        if (record.stock === 0) { color = 'red'; icon = <WarningOutlined />; }
        else if (record.stock <= record.minStock) { color = 'orange'; icon = <WarningOutlined />; }
        
        return (
          <Tag color={color} icon={icon}>
            {record.stock} {record.unit}
          </Tag>
        );
      }
    },
    { title: 'Ngưỡng TT', dataIndex: 'minStock', key: 'minStock', width: 100 },
    { title: 'Hành động', key: 'action', render: () => <a>Chi tiết</a> },
  ];

  const exportColumns = [
    { title: 'Mã Phiếu Tiếp Nhận', dataIndex: 'ticketCode', key: 'ticketCode', render: (text) => <b>{text}</b> },
    { title: 'KTV Yêu Cầu', dataIndex: 'ktv', key: 'ktv' },
    { title: 'Tên vật tư xin cấp', dataIndex: 'partName', key: 'partName' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', render: (val) => <Tag color="blue">{val}</Tag> },
    { title: 'Thời gian', dataIndex: 'reqDate', key: 'reqDate' },
    { title: 'Trạng thái', key: 'status', render: (_, record) => {
        if (record.status === 'pending') return <Tag color="processing">Chờ duyệt xuất</Tag>;
        if (record.status === 'approved') return <Tag color="success">Đã duyệt xuất</Tag>;
        return <Tag color="error">Từ chối</Tag>;
      }
    },
    { title: 'Thao tác', key: 'action', render: (_, record) => (
        record.status === 'pending' ? (
          <Space>
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record.key)}>Duyệt</Button>
            <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleReject(record.key)}>Từ chối</Button>
          </Space>
        ) : (
          <span style={{ color: '#8c8c8c' }}>Đã xử lý</span>
        )
      )
    },
  ];

  const importColumns = [
    { title: 'Mã Phiếu Nhập', dataIndex: 'code', key: 'code', render: (text) => <a>{text}</a> },
    { title: 'Ngày nhập', dataIndex: 'date', key: 'date' },
    { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (val) => <b>{val.toLocaleString()} đ</b> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: () => <Tag color="success">Hoàn thành</Tag> },
  ];

  const warrantyColumns = [
    { title: 'Tên linh kiện', dataIndex: 'partName', key: 'partName' },
    { title: 'Serial', dataIndex: 'serial', key: 'serial' },
    { title: 'Lỗi', dataIndex: 'error', key: 'error', render: (text) => <span style={{ color: 'red' }}>{text}</span> },
    { title: 'Nhà cung cấp bảo hành', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Ngày gửi', dataIndex: 'sendDate', key: 'sendDate' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (text) => (
        <Tag color={text === 'Đã đổi trả mới' ? 'success' : 'processing'}>{text}</Tag>
    )},
  ];

  // Tính toán số lượng cảnh báo
  const pendingRequestsCount = exportRequests.filter(r => r.status === 'pending').length;
  const lowStockCount = inventoryData.filter(i => i.stock <= i.minStock).length;

  // Xử lý lọc dữ liệu
  const filteredInventoryData = inventoryData.filter(item => {
    const matchesSearch = 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStock = true;
    if (stockFilter === 'out_of_stock') {
      matchesStock = item.stock === 0;
    } else if (stockFilter === 'low_stock') {
      matchesStock = item.stock > 0 && item.stock <= item.minStock;
    }

    return matchesSearch && matchesStock;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Quản lý Kho Vật Tư</h2>
          <span style={{ color: '#8c8c8c' }}>Theo dõi tồn kho, nhập hàng và phê duyệt xuất linh kiện</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsImportModalVisible(true)}>
          Lập phiếu nhập kho
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span>Danh mục & Tồn kho {lowStockCount > 0 && <Badge count={lowStockCount} style={{ marginLeft: 5 }} />}</span>} key="1">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <Input 
                placeholder="Tìm mã hoặc tên linh kiện..." 
                prefix={<SearchOutlined />} 
                style={{ width: 300 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              <Select 
                value={stockFilter} 
                onChange={(value) => setStockFilter(value)}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả danh mục</Option>
                <Option value="low_stock">Sắp hết hàng</Option>
                <Option value="out_of_stock">Đã hết hàng</Option>
              </Select>
            </div>
            <Table columns={inventoryColumns} dataSource={filteredInventoryData} pagination={{ pageSize: 5 }} />
          </TabPane>

          <TabPane tab={<span>Phê duyệt xuất kho {pendingRequestsCount > 0 && <Badge count={pendingRequestsCount} style={{ marginLeft: 5 }} />}</span>} key="2">
            <div style={{ marginBottom: '16px', padding: '12px', background: '#e6f4ff', borderRadius: '8px', border: '1px solid #91caff' }}>
              <CheckCircleOutlined style={{ color: '#1677ff', marginRight: '8px' }} />
              <b>Quy định kiểm soát:</b> 100% lệnh xuất linh kiện phải được gắn liền với Mã Phiếu Tiếp Nhận (Mã sửa chữa) của khách hàng để đối soát.
            </div>
            <Table columns={exportColumns} dataSource={exportRequests} pagination={{ pageSize: 5 }} />
          </TabPane>

          <TabPane tab="Lịch sử Nhập hàng" key="3">
            <Table columns={importColumns} dataSource={importHistory} pagination={{ pageSize: 5 }} />
          </TabPane>

          <TabPane tab="Quản lý Bảo hành NCC" key="4">
            <Table columns={warrantyColumns} dataSource={warrantyData} pagination={{ pageSize: 5 }} />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Nhập Kho */}
      <Modal 
        title={<div><ImportOutlined style={{ marginRight: 8 }}/> Lập phiếu nhập kho</div>}
        open={isImportModalVisible} 
        onOk={() => form.submit()} 
        onCancel={() => setIsImportModalVisible(false)}
        width={700}
        okText="Hoàn tất nhập kho"
        cancelText="Hủy"
      >
        <div style={{ marginTop: '20px' }}>
          <Form form={form} layout="vertical" onFinish={handleImportSubmit} initialValues={{ quantity: 10, price: 350000, partCode: 'RAM-8GB-D4' }}>
            <Form.Item label="Nhà cung cấp" name="supplier" rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}>
              <Select placeholder="Chọn nhà cung cấp...">
                <Option value="tlc">Công ty TNHH TLC</Option>
                <Option value="maihoang">Mai Hoàng PC</Option>
                <Option value="hanoicomputer">HANOICOMPUTER</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Ngày nhập" name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                <Form.Item label="Linh kiện" name="partCode" style={{ flex: 2, marginBottom: 0 }}>
                   <Select placeholder="Chọn linh kiện...">
                      {inventoryData.map(item => (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                      ))}
                   </Select>
                </Form.Item>
                <Form.Item label="Số lượng" name="quantity" style={{ flex: 1, marginBottom: 0 }}>
                   <Input type="number" min={1} />
                </Form.Item>
                <Form.Item label="Đơn giá nhập" name="price" style={{ flex: 1, marginBottom: 0 }}>
                   <Input type="number" min={0} />
                </Form.Item>
              </div>
              <Button type="dashed" block icon={<PlusOutlined />}>Thêm dòng linh kiện (Demo)</Button>
            </div>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Warehouse;
