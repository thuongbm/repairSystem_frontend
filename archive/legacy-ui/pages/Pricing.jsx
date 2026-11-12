import { useState } from 'react';
import { Card, Table, Typography, Button, Tag, Switch, Space } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const initialData = [
  {
    key: '1',
    name: 'Vệ sinh laptop / PC',
    group: 'Bảo trì',
    laborCost: '150.000 ₫',
    partsCost: '—',
    isActive: true,
  },
  {
    key: '2',
    name: 'Tra keo tản nhiệt',
    group: 'Bảo trì',
    laborCost: '120.000 ₫',
    partsCost: '80.000 ₫',
    isActive: true,
  },
  {
    key: '3',
    name: 'Thay RAM (8GB DDR4)',
    group: 'Nâng cấp',
    laborCost: '100.000 ₫',
    partsCost: '520.000 ₫',
    isActive: true,
  },
  {
    key: '4',
    name: 'Thay SSD 512GB',
    group: 'Nâng cấp',
    laborCost: '100.000 ₫',
    partsCost: '950.000 ₫',
    isActive: true,
  },
  {
    key: '5',
    name: 'Sửa VGA (reball chip)',
    group: 'Sửa chữa',
    laborCost: '650.000 ₫',
    partsCost: '—',
    isActive: true,
  },
  {
    key: '6',
    name: 'Thay màn hình laptop 15.6"',
    group: 'Sửa chữa',
    laborCost: '200.000 ₫',
    partsCost: '1.450.000 ₫',
    isActive: false,
  },
];

const getGroupTag = (group) => {
  switch(group) {
    case 'Bảo trì': return <Tag style={{ borderRadius: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}>{group}</Tag>;
    case 'Nâng cấp': return <Tag style={{ borderRadius: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }}>{group}</Tag>;
    case 'Sửa chữa': return <Tag style={{ borderRadius: '4px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}>{group}</Tag>;
    default: return <Tag>{group}</Tag>;
  }
};

const Pricing = () => {
  const [data, setData] = useState(initialData);

  const toggleStatus = (key, checked) => {
    setData(prevData => prevData.map(item =>
      item.key === key ? { ...item, isActive: checked } : item
    ));
  };

  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text style={{ fontWeight: 500, color: '#0f172a' }}>{text}</Text>,
    },
    {
      title: 'Nhóm',
      dataIndex: 'group',
      key: 'group',
      render: (text) => getGroupTag(text),
    },
    {
      title: 'Tiền công thợ',
      dataIndex: 'laborCost',
      key: 'laborCost',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Giá linh kiện',
      dataIndex: 'partsCost',
      key: 'partsCost',
      render: (text) => <Text type={text === '—' ? 'secondary' : 'default'}>{text}</Text>,
    },
    {
      title: 'Áp dụng',
      key: 'isActive',
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.isActive}
            size="small"
            onChange={(checked) => toggleStatus(record.key, checked)}
          />
          <Text type={record.isActive ? 'default' : 'secondary'} style={{ fontSize: '13px' }}>
            {record.isActive ? 'Áp dụng' : 'Tạm dừng'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#475569' }}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Danh mục dịch vụ & bảng giá</Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: '6px' }}>
          Thêm dịch vụ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
      />
    </Card>
  );
};

export default Pricing;