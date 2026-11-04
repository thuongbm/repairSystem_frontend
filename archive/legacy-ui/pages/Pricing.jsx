import React, { useState } from 'react';
import { Card, Table, Typography, Button, Tag, Switch, Space } from 'antd';
import { PlusOutlined, EditOutlined, GlobalOutlined } from '@ant-design/icons';

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
    case 'Bảo trì': return <Tag style={{ borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#64748b', padding: '2px 10px' }}>{group}</Tag>;
    case 'Nâng cấp': return <Tag style={{ borderRadius: '12px', background: '#e0e7ff', border: 'none', color: '#4f46e5', padding: '2px 10px' }}>{group}</Tag>;
    case 'Sửa chữa': return <Tag style={{ borderRadius: '12px', background: '#dbeafe', border: 'none', color: '#2563eb', padding: '2px 10px' }}>{group}</Tag>;
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
      render: (text) => <Text style={{ fontWeight: '500' }}>{text}</Text>,
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
            {record.isActive ? 'Đang áp dụng' : 'Ngừng'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button type="text" icon={<EditOutlined />} style={{ color: '#4b5563', display: 'flex', alignItems: 'center' }}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>Danh mục dịch vụ & bảng giá</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
            <GlobalOutlined />
            <span>Giá sẽ đồng bộ trực tiếp ra tính năng báo giá cho khách ngoài website.</span>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: '6px', background: '#1677ff' }}>
          Thêm mới
        </Button>
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

export default Pricing;
