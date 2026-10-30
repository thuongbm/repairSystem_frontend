import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Badge,
  InputNumber,
  Switch,
  Divider,
  Typography,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ImportOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../services/api';

const { Option } = Select;
const { Text, Title } = Typography;

const Warehouse = () => {
  const [form] = Form.useForm();
  const [minStockForm] = Form.useForm();

  // --- Active Tab ---
  const [activeTab, setActiveTab] = useState('inventory');

  // --- Loading States ---
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submittingImport, setSubmittingImport] = useState(false);

  // --- Dữ liệu API Backend ---
  const [inventoryList, setInventoryList] = useState([]);
  const [alertList, setAlertList] = useState([]);
  const [importHistoryList, setImportHistoryList] = useState([]);

  // --- Danh mục hỗ trợ Modal Nhập kho ---
  const [khoList, setKhoList] = useState([]);
  const [nccList, setNccList] = useState([]);
  const [linhKienList, setLinhKienList] = useState([]);

  // --- State lọc & tìm kiếm tồn kho ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKhoId, setSelectedKhoId] = useState(null);
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'low_stock' | 'out_of_stock'

  // --- State lọc lịch sử nhập ---
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');

  // --- Modal States ---
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [selectedPhieuDetail, setSelectedPhieuDetail] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modal cập nhật mức tồn tối thiểu
  const [isMinStockModalVisible, setIsMinStockModalVisible] = useState(false);
  const [editingTonKhoItem, setEditingTonKhoItem] = useState(null);
  const [updatingMinStock, setUpdatingMinStock] = useState(false);

  // --- Mock data giữ nguyên cho Phê duyệt xuất kho (KTV) & Bảo hành ---
  const [exportRequests, setExportRequests] = useState([
    { key: '1', ticketCode: 'TN-20231027-01', ktv: 'Tuấn Anh', partName: 'Ổ cứng SSD 512GB NVMe PCIe', quantity: 1, reqDate: '27/10/2023 14:30', status: 'pending' },
    { key: '2', ticketCode: 'TN-20231027-04', ktv: 'Văn Hùng', partName: 'Keo tản nhiệt Arctic MX-4 (4g)', quantity: 1, reqDate: '27/10/2023 15:10', status: 'pending', note: 'Xin cấp phát mới đợt này' },
    { key: '3', ticketCode: 'TN-20231026-12', ktv: 'Quốc Bảo', partName: 'RAM DDR4 8GB Bus 3200', quantity: 1, reqDate: '26/10/2023 09:15', status: 'approved' },
  ]);

  const [warrantyData] = useState([
    { key: '1', partName: 'Card màn hình RTX 3060 6GB', serial: 'SN30609823', error: 'Chập cháy mảng nguồn', supplier: 'Mai Hoàng PC', sendDate: '20/10/2023', status: 'Đang xử lý tại hãng' },
    { key: '2', partName: 'Ổ cứng SSD 512GB NVMe PCIe', serial: 'SNSSD512999', error: 'Không nhận ổ', supplier: 'Công ty TNHH TLC', sendDate: '15/10/2023', status: 'Đã đổi trả mới' },
  ]);

  // ==========================================
  // FETCH API FUNCTIONS
  // ==========================================

  // 1. Tải danh sách tồn kho: GET /api/kho/ton-kho
  const fetchTonKho = useCallback(async () => {
    setLoadingInventory(true);
    try {
      const params = {};
      if (selectedKhoId) params.khoId = selectedKhoId;
      if (searchTerm.trim()) params.keyword = searchTerm.trim();
      if (stockStatusFilter === 'low_stock') params.chiSapHet = true;

      const res = await api.getTonKho(params);
      const data = res?.data || res || [];
      setInventoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải tồn kho:', err);
      message.error(err.response?.data?.message || 'Không thể tải danh sách tồn kho từ máy chủ.');
    } finally {
      setLoadingInventory(false);
    }
  }, [selectedKhoId, searchTerm, stockStatusFilter]);

  // 2. Tải cảnh báo hết hàng / sắp hết: GET /api/kho/canh-bao-het-hang
  const fetchCanhBao = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await api.getCanhBaoTonKho(selectedKhoId || undefined);
      const data = res?.data || res || [];
      setAlertList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải cảnh báo kho:', err);
    } finally {
      setLoadingAlerts(false);
    }
  }, [selectedKhoId]);

  // 3. Tải lịch sử phiếu nhập: GET /api/phieu-nhap
  const fetchPhieuNhap = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const params = {};
      if (historyStatusFilter !== 'all') params.trangThai = historyStatusFilter;
      if (selectedKhoId) params.khoId = selectedKhoId;

      const res = await api.getPhieuNhap(params);
      const data = res?.data || res || [];
      setImportHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải lịch sử phiếu nhập:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [historyStatusFilter, selectedKhoId]);

  // 4. Tải danh mục hỗ trợ nhập kho (Kho, Nhà cung cấp, Linh kiện)
  const fetchMetaCatalogs = useCallback(async () => {
    try {
      const [khoRes, nccRes, lkRes] = await Promise.allSettled([
        api.getKho(),
        api.getNhaCungCap(),
        api.getLinhKien(),
      ]);

      if (khoRes.status === 'fulfilled') {
        const data = khoRes.value?.data || khoRes.value || [];
        setKhoList(Array.isArray(data) ? data : []);
      }
      if (nccRes.status === 'fulfilled') {
        const data = nccRes.value?.data || nccRes.value || [];
        setNccList(Array.isArray(data) ? data : []);
      }
      if (lkRes.status === 'fulfilled') {
        const data = lkRes.value?.data || lkRes.value || [];
        setLinhKienList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục cấu hình kho:', err);
    }
  }, []);

  // Khởi chạy khi component mount
  useEffect(() => {
    fetchTonKho();
    fetchCanhBao();
    fetchPhieuNhap();
    fetchMetaCatalogs();
  }, [fetchTonKho, fetchCanhBao, fetchPhieuNhap, fetchMetaCatalogs]);

  // ==========================================
  // XỬ LÝ LẬP PHIẾU NHẬP (POST /api/phieu-nhap/tao-moi)
  // ==========================================

  const handleOpenImportModal = (prefillLinhKienId = null, prefillQty = 10) => {
    // Giá trị khởi tạo cho form
    const defaultKhoId = khoList.length > 0 ? khoList[0].id : undefined;
    const defaultNccId = nccList.length > 0 ? nccList[0].id : undefined;
    const defaultPartId = prefillLinhKienId || (linhKienList.length > 0 ? linhKienList[0].id : undefined);

    form.resetFields();
    form.setFieldsValue({
      khoId: defaultKhoId,
      nhaCungCapId: defaultNccId,
      ngayNhap: dayjs(),
      xacNhanNgay: true,
      chiTiet: [
        {
          linhKienId: defaultPartId,
          soLuongNhap: prefillQty,
          donGiaNhap: 0,
        },
      ],
    });

    setIsImportModalVisible(true);
  };

  const handleImportSubmit = async (values) => {
    if (!values.chiTiet || values.chiTiet.length === 0) {
      message.error('Vui lòng thêm ít nhất một dòng linh kiện cần nhập!');
      return;
    }

    setSubmittingImport(true);
    try {
      const payload = {
        nhaCungCapId: values.nhaCungCapId,
        khoId: values.khoId,
        soChungTuNcc: values.soChungTuNcc?.trim() || null,
        ngayNhap: values.ngayNhap ? values.ngayNhap.toISOString() : null,
        ghiChu: values.ghiChu?.trim() || null,
        xacNhanNgay: values.xacNhanNgay ?? true,
        chiTiet: values.chiTiet.map((item) => ({
          linhKienId: Number(item.linhKienId),
          soLuongNhap: Number(item.soLuongNhap),
          donGiaNhap: Number(item.donGiaNhap || 0),
        })),
      };

      const res = await api.taoPhieuNhap(payload);
      const isSuccessDirect = values.xacNhanNgay !== false;
      message.success(
        res?.message || (isSuccessDirect
          ? 'Lập phiếu nhập thành công, số lượng tồn kho đã được cộng dồn tức thì!'
          : 'Đã lưu phiếu nhập nháp!')
      );

      setIsImportModalVisible(false);
      form.resetFields();

      // Đồng bộ ngay lập tức dữ liệu mới từ Backend
      fetchTonKho();
      fetchCanhBao();
      fetchPhieuNhap();
    } catch (err) {
      console.error('Lỗi tạo phiếu nhập:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        'Tạo phiếu nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      message.error(errorMsg);
    } finally {
      setSubmittingImport(false);
    }
  };

  // Xác nhận phiếu nhập nháp: POST /api/phieu-nhap/{id}/xac-nhan
  const handleConfirmDraftImport = async (id) => {
    try {
      const res = await api.xacNhanPhieuNhap(id);
      message.success(res?.message || 'Đã xác nhận nhập kho và cộng tồn kho thành công!');
      fetchPhieuNhap();
      fetchTonKho();
      fetchCanhBao();
    } catch (err) {
      message.error(err.response?.data?.message || 'Xác nhận nhập kho thất bại.');
    }
  };

  // Hủy phiếu nhập: POST /api/phieu-nhap/{id}/huy
  const handleCancelDraftImport = async (id) => {
    try {
      const res = await api.huyPhieuNhap(id);
      message.success(res?.message || 'Đã hủy phiếu nhập.');
      fetchPhieuNhap();
    } catch (err) {
      message.error(err.response?.data?.message || 'Hủy phiếu nhập thất bại.');
    }
  };

  // Xem chi tiết phiếu nhập: GET /api/phieu-nhap/{id}
  const handleViewDetail = async (id) => {
    setIsDetailModalVisible(true);
    setLoadingDetail(true);
    try {
      const res = await api.getPhieuNhapById(id);
      setSelectedPhieuDetail(res?.data || res);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tải chi tiết phiếu nhập.');
      setIsDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Cập nhật mức tồn tối thiểu: PUT /api/kho/ton-kho/{khoId}/{linhKienId}/muc-ton-toi-thieu
  const handleOpenEditMinStock = (record) => {
    setEditingTonKhoItem(record);
    minStockForm.setFieldsValue({
      mucTonToiThieu: record.mucTonToiThieu,
    });
    setIsMinStockModalVisible(true);
  };

  const handleUpdateMinStock = async (values) => {
    if (!editingTonKhoItem) return;
    setUpdatingMinStock(true);
    try {
      await api.capNhatMucTonToiThieu(
        editingTonKhoItem.khoId,
        editingTonKhoItem.linhKienId,
        values.mucTonToiThieu
      );
      message.success('Cập nhật mức tồn tối thiểu thành công!');
      setIsMinStockModalVisible(false);
      fetchTonKho();
      fetchCanhBao();
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật mức tồn tối thiểu thất bại.');
    } finally {
      setUpdatingMinStock(false);
    }
  };

  // ==========================================
  // XỬ LÝ PHÊ DUYỆT XUẤT KHO (KTV)
  // ==========================================
  const handleApprove = (key) => {
    setExportRequests((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status: 'approved' } : item))
    );
    message.success('Đã duyệt phiếu xuất kho cho kỹ thuật viên!');
  };

  const handleReject = (key) => {
    setExportRequests((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status: 'rejected' } : item))
    );
    message.error('Đã từ chối phiếu xuất kho.');
  };

  // ==========================================
  // BỘ LỌC TỒN KHO PHÍA CLIENT (KẾT HỢP API)
  // ==========================================
  const filteredInventoryData = inventoryList.filter((item) => {
    // Lọc theo từ khóa
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (item.maLk && item.maLk.toLowerCase().includes(search)) ||
      (item.tenLinhKien && item.tenLinhKien.toLowerCase().includes(search));

    // Lọc theo kho
    const matchesKho = !selectedKhoId || item.khoId === selectedKhoId;

    // Lọc theo trạng thái tồn
    let matchesStatus = true;
    if (stockStatusFilter === 'out_of_stock') {
      matchesStatus = item.soLuongTon === 0;
    } else if (stockStatusFilter === 'low_stock') {
      matchesStatus = item.sapHet || item.soLuongTon <= item.mucTonToiThieu;
    }

    return matchesSearch && matchesKho && matchesStatus;
  });

  // ==========================================
  // CẤU HÌNH CỘT BẢNG (COLUMNS)
  // ==========================================

  // 1. Cột bảng Tồn kho (GET /api/kho/ton-kho)
  const inventoryColumns = [
    {
      title: 'Mã LK',
      dataIndex: 'maLk',
      key: 'maLk',
      width: 140,
      render: (text) => <Tag color="blue" style={{ fontWeight: 600 }}>{text}</Tag>,
    },
    {
      title: 'Tên linh kiện / Vật tư',
      dataIndex: 'tenLinhKien',
      key: 'tenLinhKien',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Kho lưu trữ',
      dataIndex: 'tenKho',
      key: 'tenKho',
      width: 150,
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'donViTinh',
      key: 'donViTinh',
      width: 100,
      align: 'center',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'soLuongTon',
      key: 'soLuongTon',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.soLuongTon - b.soLuongTon,
      render: (val, record) => {
        let color = 'success';
        let icon = null;
        let tooltipText = 'Tồn kho an toàn';

        if (val === 0) {
          color = 'error';
          icon = <WarningOutlined />;
          tooltipText = 'Đã hết hàng hoàn toàn!';
        } else if (record.sapHet || val <= record.mucTonToiThieu) {
          color = 'warning';
          icon = <WarningOutlined />;
          tooltipText = `Dưới ngưỡng an toàn (${record.mucTonToiThieu} ${record.donViTinh})`;
        }

        return (
          <Tag color={color} icon={icon} style={{ padding: '2px 10px', fontSize: '13px', fontWeight: 600 }}>
            {val} {record.donViTinh}
          </Tag>
        );
      },
    },
    {
      title: 'Ngưỡng an toàn',
      dataIndex: 'mucTonToiThieu',
      key: 'mucTonToiThieu',
      width: 140,
      align: 'center',
      render: (val, record) => (
        <Space orientation="horizontal" size={4}>
          <Text type="secondary">{val} {record.donViTinh}</Text>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#1677ff', fontSize: '12px' }} />}
            onClick={() => handleOpenEditMinStock(record)}
            title="Đổi ngưỡng an toàn"
          />
        </Space>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'ngayCapNhat',
      key: 'ngayCapNhat',
      width: 150,
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleOpenImportModal(record.linhKienId, record.mucTonToiThieu ? Math.max(record.mucTonToiThieu * 2, 10) : 10)}
        >
          Nhập thêm
        </Button>
      ),
    },
  ];

  // 2. Cột bảng Cảnh báo hết hàng (GET /api/kho/canh-bao-het-hang)
  const alertColumns = [
    {
      title: 'Mức độ',
      dataIndex: 'mucDo',
      key: 'mucDo',
      width: 140,
      render: (val) =>
        val === 'HET_HANG' ? (
          <Tag color="error" icon={<WarningOutlined />} style={{ fontWeight: 'bold' }}>
            HẾT HÀNG (0)
          </Tag>
        ) : (
          <Tag color="warning" icon={<WarningOutlined />} style={{ fontWeight: 'bold' }}>
            SẮP HẾT
          </Tag>
        ),
    },
    {
      title: 'Mã LK',
      dataIndex: 'maLk',
      key: 'maLk',
      width: 130,
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Tên linh kiện cần nhập',
      dataIndex: 'tenLinhKien',
      key: 'tenLinhKien',
      render: (t) => <span style={{ fontWeight: 600 }}>{t}</span>,
    },
    {
      title: 'Kho',
      dataIndex: 'tenKho',
      key: 'tenKho',
      width: 140,
    },
    {
      title: 'Tồn hiện tại',
      dataIndex: 'soLuongTon',
      key: 'soLuongTon',
      width: 120,
      align: 'center',
      render: (val, record) => (
        <Text type={val === 0 ? 'danger' : 'warning'} strong>
          {val} {record.donViTinh}
        </Text>
      ),
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'mucTonToiThieu',
      key: 'mucTonToiThieu',
      width: 140,
      align: 'center',
      render: (val, record) => `${val} ${record.donViTinh}`,
    },
    {
      title: 'Đề xuất cần nhập thêm',
      dataIndex: 'canNhapThem',
      key: 'canNhapThem',
      width: 160,
      align: 'center',
      render: (val, record) => (
        <Tag color="volcano" style={{ fontWeight: 'bold', fontSize: '13px' }}>
          +{val} {record.donViTinh}
        </Tag>
      ),
    },
    {
      title: 'Xử lý',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingCartOutlined />}
          onClick={() => handleOpenImportModal(record.linhKienId, record.canNhapThem > 0 ? record.canNhapThem : 10)}
        >
          Lập phiếu nhập
        </Button>
      ),
    },
  ];

  // 3. Cột bảng Lịch sử Nhập hàng (GET /api/phieu-nhap)
  const importHistoryColumns = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'maPn',
      key: 'maPn',
      width: 160,
      render: (text, record) => (
        <a style={{ fontWeight: 'bold' }} onClick={() => handleViewDetail(record.id)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'ngayNhap',
      key: 'ngayNhap',
      width: 150,
      render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'tenNcc',
      key: 'tenNcc',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Kho nhập',
      dataIndex: 'tenKho',
      key: 'tenKho',
      width: 140,
    },
    {
      title: 'Thủ kho phụ trách',
      dataIndex: 'tenThuKho',
      key: 'tenThuKho',
      width: 160,
      render: (text) => text || <Text type="secondary">(Tự động)</Text>,
    },
    {
      title: 'Số HĐ / Chứng từ',
      dataIndex: 'soChungTuNcc',
      key: 'soChungTuNcc',
      width: 140,
      render: (text) => text || '—',
    },
    {
      title: 'Tổng tiền nhập',
      dataIndex: 'tongTienNhap',
      key: 'tongTienNhap',
      align: 'right',
      width: 150,
      render: (val) => <Text strong style={{ color: '#1677ff' }}>{(val || 0).toLocaleString()} đ</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      align: 'center',
      render: (status) => {
        if (status === 'DA_NHAP_KHO') return <Tag color="success">Đã nhập kho</Tag>;
        if (status === 'NHAP') return <Tag color="warning">Bản nháp</Tag>;
        if (status === 'HUY') return <Tag color="error">Đã hủy</Tag>;
        return <Tag>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
            title="Xem chi tiết"
          />
          {record.trangThai === 'NHAP' && (
            <>
              <Popconfirm
                title="Xác nhận nhập kho?"
                description="Kho sẽ cộng dồn số lượng tồn và cập nhật giá vốn ngay."
                onConfirm={() => handleConfirmDraftImport(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  Nhập
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Huỷ phiếu nhập?"
                onConfirm={() => handleCancelDraftImport(record.id)}
                okText="Đồng ý"
                cancelText="Không"
              >
                <Button danger size="small" icon={<CloseCircleOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 4. Cột bảng Phê duyệt xuất kho (KTV)
  const exportColumns = [
    { title: 'Mã Phiếu Tiếp Nhận', dataIndex: 'ticketCode', key: 'ticketCode', render: (text) => <b>{text}</b> },
    { title: 'KTV Yêu Cầu', dataIndex: 'ktv', key: 'ktv' },
    { title: 'Tên vật tư xin cấp', dataIndex: 'partName', key: 'partName' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', render: (val) => <Tag color="blue">{val}</Tag> },
    { title: 'Thời gian', dataIndex: 'reqDate', key: 'reqDate' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.status === 'pending') return <Tag color="processing">Chờ duyệt xuất</Tag>;
        if (record.status === 'approved') return <Tag color="success">Đã duyệt xuất</Tag>;
        return <Tag color="error">Từ chối</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Space>
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record.key)}>
              Duyệt
            </Button>
            <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleReject(record.key)}>
              Từ chối
            </Button>
          </Space>
        ) : (
          <span style={{ color: '#8c8c8c' }}>Đã xử lý</span>
        ),
    },
  ];

  // 5. Cột bảng Quản lý bảo hành NCC
  const warrantyColumns = [
    { title: 'Tên linh kiện', dataIndex: 'partName', key: 'partName' },
    { title: 'Serial', dataIndex: 'serial', key: 'serial' },
    { title: 'Lỗi', dataIndex: 'error', key: 'error', render: (text) => <span style={{ color: 'red' }}>{text}</span> },
    { title: 'Nhà cung cấp bảo hành', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Ngày gửi', dataIndex: 'sendDate', key: 'sendDate' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text) => <Tag color={text === 'Đã đổi trả mới' ? 'success' : 'processing'}>{text}</Tag>,
    },
  ];

  // Số lượng cảnh báo sắp hết/hết hàng từ API
  const lowStockCount = alertList.length;
  const pendingRequestsCount = exportRequests.filter((r) => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Thống kê nhanh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Quản lý Kho & Tồn kho Vật tư</h2>
          <Text type="secondary">
            Giai đoạn 1: Nhập kho linh kiện, tự động cộng dồn tồn kho và giám sát ngưỡng cảnh báo an toàn
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchTonKho();
              fetchCanhBao();
              fetchPhieuNhap();
              message.info('Đang làm mới dữ liệu kho...');
            }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenImportModal()}
            style={{ height: '38px', fontWeight: 600 }}
          >
            Lập phiếu nhập kho
          </Button>
        </Space>
      </div>

      {/* Thống kê chỉ số kho */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng mặt hàng theo dõi"
              value={inventoryList.length}
              prefix={<AppstoreOutlined style={{ color: '#1677ff' }} />}
              suffix="linh kiện"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Cảnh báo cần nhập thêm"
              value={lowStockCount}
              valueStyle={{ color: lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
              prefix={<WarningOutlined />}
              suffix="mặt hàng"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Tổng số phiếu nhập kho"
              value={importHistoryList.length}
              prefix={<HistoryOutlined style={{ color: '#722ed1' }} />}
              suffix="đợt nhập"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title="Yêu cầu xuất chờ duyệt"
              value={pendingRequestsCount}
              valueStyle={{ color: pendingRequestsCount > 0 ? '#fa8c16' : '#595959' }}
              prefix={<CheckCircleOutlined />}
              suffix="phiếu"
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs Chức năng chính */}
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            // TAB 1: DANH MỤC & TỒN KHO
            {
              key: 'inventory',
              label: (
                <span>
                  Danh mục & Tồn kho
                  {lowStockCount > 0 && <Badge count={lowStockCount} style={{ marginLeft: 6 }} />}
                </span>
              ),
              children: (
                <div>
                  {/* Thanh tìm kiếm và bộ lọc */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="space-between">
                    <Col xs={24} md={16}>
                      <Space wrap size="middle">
                        <Input
                          placeholder="Tìm theo mã hoặc tên linh kiện..."
                          prefix={<SearchOutlined />}
                          style={{ width: 280 }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          allowClear
                        />
                        <Select
                          placeholder="Chọn kho lưu trữ"
                          style={{ width: 180 }}
                          value={selectedKhoId}
                          onChange={(val) => setSelectedKhoId(val)}
                          allowClear
                        >
                          {khoList.map((k) => (
                            <Option key={k.id} value={k.id}>
                              {k.tenKho}
                            </Option>
                          ))}
                        </Select>
                        <Select
                          style={{ width: 170 }}
                          value={stockStatusFilter}
                          onChange={(val) => setStockStatusFilter(val)}
                        >
                          <Option value="all">Tất cả tình trạng</Option>
                          <Option value="low_stock">⚠️ Sắp hết hoặc hết</Option>
                          <Option value="out_of_stock">⛔ Đã hết hàng (0)</Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                      <Text type="secondary">
                        Hiển thị <b>{filteredInventoryData.length}</b> / {inventoryList.length} mặt hàng
                      </Text>
                    </Col>
                  </Row>

                  <Table
                    columns={inventoryColumns}
                    dataSource={filteredInventoryData}
                    rowKey={(r) => `${r.khoId}_${r.linhKienId}`}
                    loading={loadingInventory}
                    pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} linh kiện` }}
                  />
                </div>
              ),
            },

            // TAB 2: CẢNH BÁO THIẾU HÀNG
            {
              key: 'alerts',
              label: (
                <span>
                  Cảnh báo thiếu hàng
                  {lowStockCount > 0 && (
                    <Badge count={lowStockCount} style={{ marginLeft: 6, backgroundColor: '#f5222d' }} />
                  )}
                </span>
              ),
              children: (
                <div>
                  <Alert
                    message="Ngưỡng cảnh báo tự động"
                    description="Danh sách các linh kiện có tồn kho hiện tại thấp hơn hoặc bằng mức tối thiểu (Ngưỡng an toàn). Hãy tạo phiếu nhập để đảm bảo kỹ thuật viên có đủ linh kiện sửa chữa."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  />
                  <Table
                    columns={alertColumns}
                    dataSource={alertList}
                    rowKey={(r) => `alert_${r.khoId}_${r.linhKienId}`}
                    loading={loadingAlerts}
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              ),
            },

            // TAB 3: LỊCH SỬ NHẬP HÀNG (GET /api/phieu-nhap)
            {
              key: 'history',
              label: 'Lịch sử Nhập hàng',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <Space>
                      <Select
                        value={historyStatusFilter}
                        onChange={setHistoryStatusFilter}
                        style={{ width: 180 }}
                      >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="DA_NHAP_KHO">Đã nhập kho (Cộng tồn)</Option>
                        <Option value="NHAP">Bản nháp</Option>
                        <Option value="HUY">Đã hủy</Option>
                      </Select>
                      <Button icon={<ReloadOutlined />} onClick={fetchPhieuNhap}>
                        Tải lại
                      </Button>
                    </Space>

                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenImportModal()}>
                      Tạo phiếu mới
                    </Button>
                  </div>

                  <Table
                    columns={importHistoryColumns}
                    dataSource={importHistoryList}
                    rowKey="id"
                    loading={loadingHistory}
                    pagination={{ pageSize: 8, showTotal: (t) => `Tổng ${t} phiếu nhập` }}
                  />
                </div>
              ),
            },

            // TAB 4: PHÊ DUYỆT XUẤT KHO (KTV)
            {
              key: 'export_requests',
              label: (
                <span>
                  Phê duyệt xuất kho (KTV)
                  {pendingRequestsCount > 0 && <Badge count={pendingRequestsCount} style={{ marginLeft: 6 }} />}
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      marginBottom: '16px',
                      padding: '12px 16px',
                      background: '#e6f4ff',
                      borderRadius: '8px',
                      border: '1px solid #91caff',
                    }}
                  >
                    <CheckCircleOutlined style={{ color: '#1677ff', marginRight: '8px' }} />
                    <b>Quy định kiểm soát:</b> 100% lệnh xuất linh kiện phải được gắn liền với Mã Phiếu Tiếp Nhận (Mã sửa chữa) của khách hàng để đối soát.
                  </div>
                  <Table columns={exportColumns} dataSource={exportRequests} pagination={{ pageSize: 5 }} />
                </div>
              ),
            },

            // TAB 5: BẢO HÀNH NCC
            {
              key: 'warranty',
              label: 'Quản lý Bảo hành NCC',
              children: <Table columns={warrantyColumns} dataSource={warrantyData} pagination={{ pageSize: 5 }} />,
            },
          ]}
        />
      </Card>

      {/* ======================================================== */}
      {/* MODAL: LẬP PHIẾU NHẬP KHO (POST /api/phieu-nhap/tao-moi)  */}
      {/* ======================================================== */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18 }}>
            <ImportOutlined style={{ color: '#1677ff' }} />
            <span>Lập phiếu nhập kho & Tăng tồn kho</span>
          </div>
        }
        open={isImportModalVisible}
        onOk={() => form.submit()}
        confirmLoading={submittingImport}
        onCancel={() => setIsImportModalVisible(false)}
        width={760}
        okText="Hoàn tất nhập kho"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ marginTop: '16px' }}>
          <Form form={form} layout="vertical" onFinish={handleImportSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nhà cung cấp"
                  name="nhaCungCapId"
                  rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
                >
                  <Select placeholder="Chọn nhà cung cấp..." showSearch optionFilterProp="children">
                    {nccList.map((ncc) => (
                      <Option key={ncc.id} value={ncc.id}>
                        {ncc.tenNcc} ({ncc.maNcc})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Kho tiếp nhận"
                  name="khoId"
                  rules={[{ required: true, message: 'Vui lòng chọn kho nhập!' }]}
                >
                  <Select placeholder="Chọn kho..." showSearch optionFilterProp="children">
                    {khoList.map((k) => (
                      <Option key={k.id} value={k.id}>
                        {k.tenKho} ({k.maKho})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Ngày nhập hàng" name="ngayNhap" rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" allowClear={false} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số hoá đơn / Chứng từ NCC" name="soChungTuNcc">
                  <Input placeholder="Ví dụ: HD-2026/892" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" style={{ margin: '12px 0 16px 0', fontSize: '14px', color: '#1677ff' }}>
              Chi tiết danh sách linh kiện nhập
            </Divider>

            {/* Form.List cho phép nhập nhiều dòng linh kiện */}
            <Form.List name="chiTiet">
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{ background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 8 }}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <Row gutter={12} align="middle">
                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            label="Linh kiện"
                            name={[name, 'linhKienId']}
                            rules={[{ required: true, message: 'Chọn linh kiện!' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder="Chọn linh kiện..."
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.children || '').toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {linhKienList.map((item) => (
                                <Option key={item.id} value={item.id}>
                                  [{item.maLk}] {item.tenLinhKien}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            label="Số lượng"
                            name={[name, 'soLuongNhap']}
                            rules={[{ required: true, message: 'Nhập SL!' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="SL" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            label="Đơn giá nhập (đ)"
                            name={[name, 'donGiaNhap']}
                            rules={[{ required: true, message: 'Nhập đơn giá!' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              style={{ width: '100%' }}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              placeholder="Giá vốn"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2} style={{ textAlign: 'center', paddingTop: 24 }}>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              title="Xóa dòng"
                            />
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add({ linhKienId: linhKienList[0]?.id, soLuongNhap: 10, donGiaNhap: 0 })}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 4 }}
                  >
                    Thêm dòng linh kiện
                  </Button>
                </div>
              )}
            </Form.List>

            <Divider style={{ margin: '16px 0 12px 0' }} />

            <Row gutter={16} align="middle">
              <Col span={12}>
                <Form.Item
                  label="Tùy chọn ghi nhận kho"
                  name="xacNhanNgay"
                  valuePropName="checked"
                  style={{ marginBottom: 8 }}
                >
                  <Switch
                    checkedChildren="Nhập kho ngay (Cộng tồn)"
                    unCheckedChildren="Lưu bản nháp"
                    defaultChecked
                  />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Khi bật "Nhập kho ngay", hệ thống sẽ lập tức tăng số lượng tồn của các linh kiện tương ứng.
                </Text>
              </Col>
              <Col span={12}>
                <Form.Item label="Ghi chú phiếu nhập" name="ghiChu" style={{ marginBottom: 8 }}>
                  <Input.TextArea rows={2} placeholder="Ghi chú nội dung lô hàng, quy cách đóng gói..." />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: XEM CHI TIẾT PHIẾU NHẬP (GET /api/phieu-nhap/{id})*/}
      {/* ======================================================== */}
      <Modal
        title={
          <div>
            <EyeOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            Chi tiết phiếu nhập kho: <b>{selectedPhieuDetail?.phieu?.maPn}</b>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
        loading={loadingDetail}
      >
        {selectedPhieuDetail && (
          <div style={{ marginTop: 12 }}>
            <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text type="secondary">Nhà cung cấp: </Text>
                <b>{selectedPhieuDetail.phieu.tenNcc}</b>
              </Col>
              <Col span={12}>
                <Text type="secondary">Kho tiếp nhận: </Text>
                <b>{selectedPhieuDetail.phieu.tenKho}</b>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ngày nhập: </Text>
                <span>{dayjs(selectedPhieuDetail.phieu.ngayNhap).format('DD/MM/YYYY HH:mm')}</span>
              </Col>
              <Col span={12}>
                <Text type="secondary">Trạng thái: </Text>
                <Tag color={selectedPhieuDetail.phieu.trangThai === 'DA_NHAP_KHO' ? 'success' : 'warning'}>
                  {selectedPhieuDetail.phieu.trangThai === 'DA_NHAP_KHO' ? 'Đã nhập kho' : selectedPhieuDetail.phieu.trangThai}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">Số chứng từ: </Text>
                <span>{selectedPhieuDetail.phieu.soChungTuNcc || '—'}</span>
              </Col>
              <Col span={12}>
                <Text type="secondary">Thủ kho: </Text>
                <span>{selectedPhieuDetail.phieu.tenThuKho || '—'}</span>
              </Col>
            </Row>

            <Divider orientation="left" style={{ margin: '8px 0 12px 0' }}>
              Danh sách mặt hàng trong phiếu
            </Divider>

            <Table
              size="small"
              dataSource={selectedPhieuDetail.chiTiet || []}
              rowKey="linhKienId"
              pagination={false}
              columns={[
                { title: 'Mã LK', dataIndex: 'maLk', width: 120 },
                { title: 'Tên linh kiện', dataIndex: 'tenLinhKien' },
                { title: 'ĐVT', dataIndex: 'donViTinh', width: 70, align: 'center' },
                { title: 'SL Nhập', dataIndex: 'soLuongNhap', width: 90, align: 'center' },
                {
                  title: 'Đơn giá',
                  dataIndex: 'donGiaNhap',
                  align: 'right',
                  width: 120,
                  render: (v) => `${(v || 0).toLocaleString()} đ`,
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'thanhTien',
                  align: 'right',
                  width: 140,
                  render: (v) => <b>{(v || 0).toLocaleString()} đ</b>,
                },
              ]}
              summary={(pageData) => {
                const total = pageData.reduce((prev, curr) => prev + (curr.thanhTien || 0), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>
                      Tổng cộng tiền hàng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} style={{ textAlign: 'right', color: '#1677ff', fontWeight: 'bold' }}>
                      {total.toLocaleString()} đ
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: SỬA MỨC TỒN TỐI THIỂU (PUT /api/kho/ton-kho/...) */}
      {/* ======================================================== */}
      <Modal
        title="Thiết lập ngưỡng tồn an toàn (Mức tồn tối thiểu)"
        open={isMinStockModalVisible}
        onOk={() => minStockForm.submit()}
        confirmLoading={updatingMinStock}
        onCancel={() => setIsMinStockModalVisible(false)}
        okText="Lưu ngưỡng"
        cancelText="Hủy"
      >
        {editingTonKhoItem && (
          <div style={{ marginTop: 16 }}>
            <p>
              Linh kiện: <b>{editingTonKhoItem.tenLinhKien}</b> ({editingTonKhoItem.maLk})
            </p>
            <p>
              Kho: <b>{editingTonKhoItem.tenKho}</b>
            </p>
            <Form form={minStockForm} layout="vertical" onFinish={handleUpdateMinStock}>
              <Form.Item
                label="Mức tồn tối thiểu"
                name="mucTonToiThieu"
                rules={[{ required: true, message: 'Vui lòng nhập mức tồn tối thiểu' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter={editingTonKhoItem.donViTinh}
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                💡 Khi số lượng tồn thực tế nhỏ hơn hoặc bằng số này, hệ thống sẽ đưa linh kiện vào danh sách Cảnh báo thiếu hàng.
              </Text>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Warehouse;
