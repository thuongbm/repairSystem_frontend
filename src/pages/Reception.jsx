import React from 'react';
import { Card, Table, Typography, Input, Button, Tag, Space, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const data = [
  {
    key: '1',
    code: 'PN-5510',
    customer: 'Vũ Hải Đăng',
    phone: '0912 345 678',
    device: 'Laptop Dell XPS 15',
    issue: 'Máy nóng, quạt kêu to',
    receiveDate: '25/09 08:15',
    technician: 'Nguyễn Văn Hùng',
    status: 'Đang kiểm tra',
  },
  {
    key: '2',
    code: 'PN-5511',
    customer: 'Ngô Thanh Vân',
    phone: '0987 654 321',
    device: 'PC Gaming RTX 3070',
    issue: 'Không lên hình, nghi lỗi VGA',
    receiveDate: '25/09 08:40',
    technician: 'Lê Minh Tuấn',
    status: 'Chờ linh kiện',
  },
  {
    key: '3',
    code: 'PN-5512',
    customer: 'Bùi Anh Khoa',
    phone: '0906 111 222',
    device: 'MacBook Pro M1',
    issue: 'Nâng cấp RAM 16GB',
    receiveDate: '25/09 09:05',
    technician: 'Trần Quốc Bảo',
    status: 'Đang sửa',
  },
  {
    key: '4',
    code: 'PN-5513',
    customer: 'Lý Kim Ngân',
    phone: '0933 444 555',
    device: 'Máy in Canon 2900',
    issue: 'Kẹt giấy, in mờ',
    receiveDate: '25/09 09:30',
    technician: 'Chưa phân công',
    status: 'Mới tiếp nhận',
  },
  {
    key: '5',
    code: 'PN-5514',
    customer: 'Hoàng Minh Đức',
    phone: '0977 888 999',
    device: 'Laptop Asus TUF',
    issue: 'Thay bàn phím + vệ sinh',
    receiveDate: '24/09 16:20',
    technician: 'Phạm Gia Huy',
    status: 'Hoàn thành',
  },
];

const getStatusTag = (status) => {
  switch (status) {
    case 'Đang kiểm tra':
      return <Tag color="cyan" style={{ borderRadius: '10px', padding: '2px 10px' }}>{status}</Tag>;
    case 'Chờ linh kiện':
      return <Tag color="warning" style={{ borderRadius: '10px', padding: '2px 10px' }}>{status}</Tag>;
    case 'Đang sửa':
      return <Tag color="blue" style={{ borderRadius: '10px', padding: '2px 10px' }}>{status}</Tag>;
    case 'Mới tiếp nhận':
      return <Tag color="default" style={{ borderRadius: '10px', padding: '2px 10px' }}>{status}</Tag>;
    case 'Hoàn thành':
      return <Tag color="success" style={{ borderRadius: '10px', padding: '2px 10px' }}>{status}</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const columns = [
  {
    title: 'Mã phiếu',
    dataIndex: 'code',
    key: 'code',
    render: (text) => <Text style={{ fontFamily: 'monospace' }}>{text}</Text>,
  },
  {
    title: 'Khách hàng',
    key: 'customer',
    render: (_, record) => (
      <div>
        <div style={{ fontWeight: '500' }}>{record.customer}</div>
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.phone}</div>
      </div>
    ),
  },
  {
    title: 'Thiết bị & lỗi',
    key: 'device',
    render: (_, record) => (
      <div>
        <div style={{ fontWeight: '500' }}>{record.device}</div>
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.issue}</div>
      </div>
    ),
  },
  {
    title: 'Tiếp nhận',
    dataIndex: 'receiveDate',
    key: 'receiveDate',
    render: (text) => <Text type="secondary">{text}</Text>,
  },
  {
    title: 'Kỹ thuật viên',
    dataIndex: 'technician',
    key: 'technician',
    render: (text) => (
      <Text type={text === 'Chưa phân công' ? 'secondary' : 'default'} style={{ fontStyle: text === 'Chưa phân công' ? 'italic' : 'normal' }}>
        {text}
      </Text>
    ),
  },
  {
    title: 'Trạng thái',
    key: 'status',
    dataIndex: 'status',
    render: (status) => getStatusTag(status),
  },
];

const Reception = () => {
  return (
    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Danh sách máy tiếp nhận</Title>
          <Text type="secondary">Theo dõi tiến trình xử lý của từng thiết bị trong xưởng.</Text>
        </div>
        <Space>
          <Input 
            placeholder="Tìm mã phiếu / SĐT" 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
            style={{ width: 250, borderRadius: '6px' }}
          />
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: '6px', background: '#1677ff' }}>
            Tiếp nhận máy
          </Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}
        rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
      />
    </Card>
  );
};

export default Reception;
