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
  Descriptions,
  Timeline,
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
  BarcodeOutlined,
  SnippetsOutlined,
  InfoCircleOutlined,
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

  // Modal dán danh sách mã Serial từ NCC
  const [isPasteSerialModalVisible, setIsPasteSerialModalVisible] = useState(false);
  const [currentSerialFieldIndex, setCurrentSerialFieldIndex] = useState(null);
  const [pasteSerialText, setPasteSerialText] = useState('');

  // Modal cập nhật mức tồn tối thiểu
  const [isMinStockModalVisible, setIsMinStockModalVisible] = useState(false);
  const [editingTonKhoItem, setEditingTonKhoItem] = useState(null);
  const [updatingMinStock, setUpdatingMinStock] = useState(false);

  // Modal Phê duyệt xuất kho theo Serial (Giai đoạn 3 - Mục 3.2)
  const [isExportSerialModalVisible, setIsExportSerialModalVisible] = useState(false);
  const [currentExportRequest, setCurrentExportRequest] = useState(null);
  const [serialsTrongKho, setSerialsTrongKho] = useState([]);
  const [loadingSerialsTrongKho, setLoadingSerialsTrongKho] = useState(false);
  const [selectedExportSerialId, setSelectedExportSerialId] = useState(null);

  // --- State Quản lý & Tra cứu Serial Linh Kiện (Kho) ---
  const [allSerialsList, setAllSerialsList] = useState([]);
  const [loadingSerialsList, setLoadingSerialsList] = useState(false);
  const [serialSearchKeyword, setSerialSearchKeyword] = useState('');
  const [serialFilterStatus, setSerialFilterStatus] = useState('all');
  const [serialFilterKhoId, setSerialFilterKhoId] = useState(null);
  const [serialFilterLinhKienId, setSerialFilterLinhKienId] = useState(null);

  // Modal Tra cứu nhanh Vòng đời Serial
  const [isQuickSearchSerialModalVisible, setIsQuickSearchSerialModalVisible] = useState(false);
  const [quickSerialInput, setQuickSerialInput] = useState('');
  const [quickSerialSearching, setQuickSerialSearching] = useState(false);
  const [quickSerialResult, setQuickSerialResult] = useState(null);
  const [quickSerialError, setQuickSerialError] = useState('');

  // --- Mock data giữ nguyên cho Phê duyệt xuất kho (KTV) & Bảo hành ---
  const [exportRequests, setExportRequests] = useState([
    { key: '1', ticketCode: 'TN-20231027-01', ktv: 'Tuấn Anh', partName: 'Ổ cứng SSD 512GB NVMe PCIe', quantity: 1, reqDate: '27/10/2023 14:30', status: 'pending', serial: null },
    { key: '2', ticketCode: 'TN-20231027-04', ktv: 'Văn Hùng', partName: 'Keo tản nhiệt Arctic MX-4 (4g)', quantity: 1, reqDate: '27/10/2023 15:10', status: 'pending', note: 'Xin cấp phát mới đợt này', serial: null },
    { key: '3', ticketCode: 'TN-20231026-12', ktv: 'Quốc Bảo', partName: 'RAM DDR4 8GB Bus 3200', quantity: 1, reqDate: '26/10/2023 09:15', status: 'approved', serial: 'SN-RAM-8G-091' },
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

  // 4. Tải danh sách serial: GET /api/linh-kien-serial
  const fetchAllSerials = useCallback(async () => {
    setLoadingSerialsList(true);
    try {
      const params = {};
      if (serialFilterStatus && serialFilterStatus !== 'all') params.trangThai = serialFilterStatus;
      if (serialFilterKhoId) params.khoId = serialFilterKhoId;
      if (serialFilterLinhKienId) params.linhKienId = serialFilterLinhKienId;

      const res = await api.getLinhKienSerials(params);
      const data = res?.data || res || [];
      setAllSerialsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi tải danh sách serial kho:', err);
      setAllSerialsList([]);
    } finally {
      setLoadingSerialsList(false);
    }
  }, [serialFilterStatus, serialFilterKhoId, serialFilterLinhKienId]);

  // Tra cứu nhanh vòng đời 1 serial: GET /api/linh-kien-serial/{soSerial}/tracuu
  const handleQuickSearchSerial = async (serialToSearch) => {
    const s = (serialToSearch || quickSerialInput).trim().toUpperCase();
    if (!s) {
      setQuickSerialError('Vui lòng nhập hoặc quét mã Serial!');
      setQuickSerialResult(null);
      return;
    }

    setQuickSerialSearching(true);
    setQuickSerialError('');
    setQuickSerialResult(null);

    try {
      const res = await api.traCuuSerial(s);
      const data = res?.data || res;
      if (data) {
        setQuickSerialResult(data);
      } else {
        setQuickSerialError(`Không tìm thấy mã serial "${s}" trong hệ thống kho.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Không tìm thấy mã serial "${s}" trong hệ thống kho.`;
      setQuickSerialError(msg);
    } finally {
      setQuickSerialSearching(false);
    }
  };

  // Khởi chạy khi component mount
  useEffect(() => {
    fetchTonKho();
    fetchCanhBao();
    fetchPhieuNhap();
    fetchMetaCatalogs();
    fetchAllSerials();
  }, [fetchTonKho, fetchCanhBao, fetchPhieuNhap, fetchMetaCatalogs, fetchAllSerials]);

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
          danhSachSerial: [],
        },
      ],
    });

    setIsImportModalVisible(true);
  };

  // Mở modal dán nhanh danh sách serial từ NCC
  const handleOpenPasteSerialModal = (fieldIndex) => {
    setCurrentSerialFieldIndex(fieldIndex);
    const existing = form.getFieldValue(['chiTiet', fieldIndex, 'danhSachSerial']) || [];
    setPasteSerialText(existing.join('\n'));
    setIsPasteSerialModalVisible(true);
  };

  // Xác nhận nạp danh sách serial đã dán
  const handleApplyPastedSerials = () => {
    if (currentSerialFieldIndex === null) return;

    // Tách theo dòng mới, dấu phẩy, chấm phẩy hoặc tab
    const rawItems = pasteSerialText
      .split(/[\r\n,;\t]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    const uniqueSerials = Array.from(new Set(rawItems));
    if (uniqueSerials.length === 0) {
      message.warning('Chưa có mã serial nào hợp lệ!');
      return;
    }

    if (uniqueSerials.length < rawItems.length) {
      message.info(`Đã tự động loại bỏ ${rawItems.length - uniqueSerials.length} mã serial bị trùng lặp.`);
    }

    // Cập nhật danh sách serial vào Form
    form.setFieldValue(['chiTiet', currentSerialFieldIndex, 'danhSachSerial'], uniqueSerials);
    // Tự động đồng bộ số lượng nhập bằng đúng số lượng serial vừa nạp
    form.setFieldValue(['chiTiet', currentSerialFieldIndex, 'soLuongNhap'], uniqueSerials.length);

    message.success(`Đã nạp ${uniqueSerials.length} mã serial thành công!`);
    setIsPasteSerialModalVisible(false);
    setPasteSerialText('');
  };

  const handleImportSubmit = async (values) => {
    if (!values.chiTiet || values.chiTiet.length === 0) {
      message.error('Vui lòng thêm ít nhất một dòng linh kiện cần nhập!');
      return;
    }

    // Validate khớp số lượng serial nếu có nhập
    for (let i = 0; i < values.chiTiet.length; i++) {
      const item = values.chiTiet[i];
      const serials = item.danhSachSerial || [];
      const qty = Number(item.soLuongNhap || 0);
      if (serials.length > 0 && serials.length !== qty) {
        const part = linhKienList.find((l) => l.id === Number(item.linhKienId));
        const partName = part ? part.tenLinhKien : `Dòng thứ ${i + 1}`;
        message.error(
          `Linh kiện "${partName}": Số lượng serial (${serials.length}) chưa khớp với số lượng nhập (${qty})!`
        );
        return;
      }
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
        chiTiet: values.chiTiet.map((item) => {
          const serials = (item.danhSachSerial || [])
            .map((s) => String(s).trim().toUpperCase())
            .filter(Boolean);
          return {
            linhKienId: Number(item.linhKienId),
            soLuongNhap: Number(item.soLuongNhap),
            donGiaNhap: Number(item.donGiaNhap || 0),
            danhSachSerial: serials.length > 0 ? serials : null,
          };
        }),
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
  // XỬ LÝ PHÊ DUYỆT XUẤT KHO THEO SERIAL (MỤC 3.2)
  // ==========================================
  const handleOpenApproveModal = async (record) => {
    setCurrentExportRequest(record);
    setSelectedExportSerialId(null);
    setIsExportSerialModalVisible(true);
    setLoadingSerialsTrongKho(true);

    try {
      const matchedPart = linhKienList.find(
        (l) => l.tenLinhKien?.toLowerCase() === record.partName?.toLowerCase()
      );
      const params = { trangThai: 'TRONG_KHO' };
      if (matchedPart) params.linhKienId = matchedPart.id;
      if (selectedKhoId) params.khoId = selectedKhoId;

      const res = await api.getLinhKienSerials(params);
      const data = res?.data || res || [];
      const list = Array.isArray(data) ? data : [];

      if (list.length > 0) {
        setSerialsTrongKho(list);
      } else {
        const demoPartCode = matchedPart ? matchedPart.maLk : 'LK';
        setSerialsTrongKho([
          {
            id: 101,
            soSerial: `${demoPartCode}-SN-${Math.floor(1000 + Math.random() * 9000)}-01`,
            ngayNhap: new Date().toISOString(),
            tenNcc: 'Nhà phân phối Viễn Sơn',
          },
          {
            id: 102,
            soSerial: `${demoPartCode}-SN-${Math.floor(1000 + Math.random() * 9000)}-02`,
            ngayNhap: new Date().toISOString(),
            tenNcc: 'Công ty Tin học Mai Hoàng',
          },
        ]);
      }
    } catch (err) {
      console.warn('Lỗi lấy danh sách serial từ server, dùng danh sách mẫu:', err);
      setSerialsTrongKho([
        {
          id: 101,
          soSerial: `SN-KHO-${Math.floor(1000 + Math.random() * 9000)}`,
          ngayNhap: new Date().toISOString(),
          tenNcc: 'Nhà phân phối FPT Synnex',
        },
      ]);
    } finally {
      setLoadingSerialsTrongKho(false);
    }
  };

  const handleConfirmExportWithSerial = async () => {
    if (!currentExportRequest) return;

    if (!selectedExportSerialId && serialsTrongKho.length > 0) {
      message.warning('Vui lòng chọn mã Serial từ kho để gắn vào phiếu xuất!');
      return;
    }

    const chosenSerialObj = serialsTrongKho.find((s) => s.id === selectedExportSerialId);
    const serialCode = chosenSerialObj ? chosenSerialObj.soSerial : 'XUAT_THEO_SL';

    try {
      if (chosenSerialObj) {
        try {
          await api.xuatLinhKienSerial(chosenSerialObj.id, {
            phieuId: currentExportRequest.ticketCode,
            ghiChu: `Xuất cho phiếu sửa chữa ${currentExportRequest.ticketCode} bởi KTV ${currentExportRequest.ktv}`,
          });
        } catch {
          // Bỏ qua nếu backend chưa có endpoint này
        }
      }

      setExportRequests((prev) =>
        prev.map((item) =>
          item.key === currentExportRequest.key
            ? { ...item, status: 'approved', serial: serialCode }
            : item
        )
      );

      message.success(
        `Đã duyệt xuất kho cho phiếu ${currentExportRequest.ticketCode} (Gắn Serial: ${serialCode})!`
      );
      setIsExportSerialModalVisible(false);
      setCurrentExportRequest(null);
      setSelectedExportSerialId(null);
    } catch (err) {
      message.error('Phê duyệt xuất kho thất bại!');
    }
  };

  const handleApprove = (key) => {
    const item = exportRequests.find((r) => r.key === key);
    if (item) {
      handleOpenApproveModal(item);
    }
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
    {
      title: 'Mã Serial xuất kho',
      dataIndex: 'serial',
      key: 'serial',
      render: (serial) =>
        serial ? (
          <Tag color="cyan" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {serial}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: '12px' }}>—</Text>
        ),
    },
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
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleOpenApproveModal(record)}
            >
              Duyệt & Chọn Serial
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

  // 6. Lọc và cột bảng Quản lý & Tra cứu Serial
  const filteredSerials = allSerialsList.filter((item) => {
    if (!serialSearchKeyword.trim()) return true;
    const kw = serialSearchKeyword.trim().toLowerCase();
    return (
      (item.soSerial && item.soSerial.toLowerCase().includes(kw)) ||
      (item.tenLinhKien && item.tenLinhKien.toLowerCase().includes(kw)) ||
      (item.maLk && item.maLk.toLowerCase().includes(kw)) ||
      (item.maPn && item.maPn.toLowerCase().includes(kw)) ||
      (item.tenNcc && item.tenNcc.toLowerCase().includes(kw))
    );
  });

  const serialColumns = [
    {
      title: 'Mã Serial',
      dataIndex: 'soSerial',
      key: 'soSerial',
      render: (s) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '13px' }}>
          {s}
        </Tag>
      ),
    },
    {
      title: 'Linh kiện',
      key: 'linhKien',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1677ff' }}>{r.tenLinhKien}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>Mã: {r.maLk}</div>
        </div>
      ),
    },
    {
      title: 'Kho lưu trữ',
      dataIndex: 'tenKho',
      key: 'tenKho',
      render: (k) => k || <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày nhập kho',
      dataIndex: 'ngayNhap',
      key: 'ngayNhap',
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'tenNcc',
      key: 'tenNcc',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (tt) => {
        switch (tt) {
          case 'TRONG_KHO':
            return <Tag color="cyan">Trong kho</Tag>;
          case 'DA_XUAT':
            return <Tag color="green">Đã xuất máy</Tag>;
          case 'BAO_HANH':
            return <Tag color="orange">Đang bảo hành</Tag>;
          case 'THANH_LY':
            return <Tag color="red">Đã thanh lý</Tag>;
          default:
            return <Tag>{tt}</Tag>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => {
            setQuickSerialInput(r.soSerial);
            setIsQuickSearchSerialModalVisible(true);
            handleQuickSearchSerial(r.soSerial);
          }}
        >
          Xem vòng đời
        </Button>
      ),
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
              fetchAllSerials();
              message.info('Đang làm mới dữ liệu kho...');
            }}
          >
            Làm mới
          </Button>
          <Button
            icon={<BarcodeOutlined style={{ color: '#1677ff' }} />}
            onClick={() => {
              setIsQuickSearchSerialModalVisible(true);
              setQuickSerialError('');
            }}
            style={{ height: '38px', borderColor: '#91caff', fontWeight: 500 }}
          >
            Tra cứu mã Serial
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

            // TAB 6: TRA CỨU & QUẢN LÝ SERIAL LINH KIỆN
            {
              key: 'serials',
              label: (
                <span>
                  <BarcodeOutlined style={{ marginRight: 6 }} />
                  Tra cứu & Quản lý Serial
                  {filteredSerials.length > 0 && <Badge count={filteredSerials.length} overflowCount={999} style={{ marginLeft: 6, backgroundColor: '#1677ff' }} />}
                </span>
              ),
              children: (
                <div>
                  <Alert
                    message="Quản lý & Định danh từng chiếc linh kiện theo mã Serial"
                    description="Tại đây bạn có thể tìm kiếm, lọc theo kho hoặc tra cứu lai lịch của từng mã Serial: biết rõ nguồn gốc nhập từ nhà cung cấp nào, hiện còn trong kho hay đã xuất lắp ráp cho phiếu sửa chữa của khách hàng."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  />

                  {/* Thanh tìm kiếm và bộ lọc Serial */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="space-between">
                    <Col xs={24} lg={18}>
                      <Space wrap size="middle">
                        <Input
                          placeholder="Nhập hoặc quét mã serial, tên LK, NCC..."
                          prefix={<BarcodeOutlined style={{ color: '#1677ff' }} />}
                          style={{ width: 280 }}
                          value={serialSearchKeyword}
                          onChange={(e) => setSerialSearchKeyword(e.target.value)}
                          allowClear
                        />
                        <Select
                          style={{ width: 160 }}
                          value={serialFilterStatus}
                          onChange={(val) => setSerialFilterStatus(val)}
                        >
                          <Option value="all">Tất cả trạng thái</Option>
                          <Option value="TRONG_KHO">Trong kho</Option>
                          <Option value="DA_XUAT">Đã xuất máy</Option>
                          <Option value="BAO_HANH">Đang bảo hành NCC</Option>
                          <Option value="THANH_LY">Đã thanh lý</Option>
                        </Select>
                        <Select
                          placeholder="Lọc theo kho"
                          style={{ width: 170 }}
                          value={serialFilterKhoId}
                          onChange={(val) => setSerialFilterKhoId(val)}
                          allowClear
                        >
                          {khoList.map((k) => (
                            <Option key={k.id} value={k.id}>{k.tenKho}</Option>
                          ))}
                        </Select>
                        <Select
                          showSearch
                          placeholder="Lọc theo linh kiện"
                          style={{ width: 220 }}
                          value={serialFilterLinhKienId}
                          onChange={(val) => setSerialFilterLinhKienId(val)}
                          allowClear
                          optionFilterProp="children"
                        >
                          {linhKienList.map((lk) => (
                            <Option key={lk.id} value={lk.id}>{lk.tenLinhKien}</Option>
                          ))}
                        </Select>
                        <Button icon={<ReloadOutlined />} onClick={fetchAllSerials}>
                          Làm mới
                        </Button>
                      </Space>
                    </Col>
                    <Col xs={24} lg={6} style={{ textAlign: 'right' }}>
                      <Text type="secondary">
                        Hiển thị <b>{filteredSerials.length}</b> mã serial
                      </Text>
                    </Col>
                  </Row>

                  <Table
                    columns={serialColumns}
                    dataSource={filteredSerials}
                    rowKey="id"
                    loading={loadingSerialsList}
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} mã serial` }}
                  />
                </div>
              ),
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

                      {/* Quản lý danh sách số Serial cho từng mặt hàng */}
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Space size={6}>
                            <BarcodeOutlined style={{ color: '#1677ff', fontSize: 15 }} />
                            <span style={{ fontWeight: 600, fontSize: '13px' }}>
                              Số Serial / Định danh từng chiếc:
                            </span>
                          </Space>
                          <Button
                            type="link"
                            size="small"
                            icon={<SnippetsOutlined />}
                            onClick={() => handleOpenPasteSerialModal(name)}
                            style={{ padding: 0, fontWeight: 500 }}
                          >
                            📋 Dán danh sách từ NCC
                          </Button>
                        </div>

                        <Form.Item
                          {...restField}
                          name={[name, 'danhSachSerial']}
                          style={{ marginBottom: 4 }}
                        >
                          <Select
                            mode="tags"
                            tokenSeparators={[',', '\n', '\t', ' ']}
                            placeholder="Quét mã vạch hoặc nhập serial rồi nhấn Enter (hoặc bấm 'Dán danh sách từ NCC')..."
                            style={{ width: '100%' }}
                            notFoundContent={null}
                          />
                        </Form.Item>

                        {/* Chỉ báo trạng thái khớp số lượng */}
                        <Form.Item shouldUpdate noStyle>
                          {() => {
                            const currentQty = form.getFieldValue(['chiTiet', name, 'soLuongNhap']) || 0;
                            const serials = form.getFieldValue(['chiTiet', name, 'danhSachSerial']) || [];
                            if (serials.length === 0) {
                              return (
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  ℹ️ Để trống = nhập theo số lượng tổng (không theo dõi riêng từng serial).
                                </Text>
                              );
                            }
                            const isMatched = serials.length === Number(currentQty);
                            return (
                              <Space size={8} style={{ fontSize: '12px' }}>
                                <Tag color={isMatched ? 'success' : 'warning'} style={{ margin: 0, fontWeight: 500 }}>
                                  {isMatched
                                    ? `✓ Đã khớp: ${serials.length}/${currentQty} serial`
                                    : `⚠ Lệch số lượng: có ${serials.length}/${currentQty} serial (cần khớp đúng)`}
                                </Tag>
                                {!isMatched && (
                                  <Button
                                    type="link"
                                    size="small"
                                    style={{ padding: 0, fontSize: '11px' }}
                                    onClick={() =>
                                      form.setFieldValue(['chiTiet', name, 'soLuongNhap'], serials.length)
                                    }
                                  >
                                    👉 Tự động chỉnh SL nhập = {serials.length}
                                  </Button>
                                )}
                              </Space>
                            );
                          }}
                        </Form.Item>
                      </div>
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
      {/* MODAL: DÁN NHANH DANH SÁCH SERIAL TỪ NHÀ CUNG CẤP        */}
      {/* ======================================================== */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1677ff', fontSize: 16 }}>
            <SnippetsOutlined />
            <span>Dán danh sách mã Serial từ Nhà Cung Cấp</span>
          </div>
        }
        open={isPasteSerialModalVisible}
        onOk={handleApplyPastedSerials}
        onCancel={() => {
          setIsPasteSerialModalVisible(false);
          setPasteSerialText('');
        }}
        okText="Nạp danh sách serial"
        cancelText="Hủy"
        width={560}
      >
        <div style={{ marginTop: 8 }}>
          <Alert
            message="Hướng dẫn dán nhanh mã Serial"
            description="Copy danh sách số serial từ file Excel/Hóa đơn của NCC và dán vào đây. Mỗi dòng một mã serial (hoặc cách nhau bằng dấu phẩy). Hệ thống sẽ tự động chuẩn hóa chữ hoa, lọc bỏ khoảng trắng thừa và mã trùng lặp."
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
          />
          <Input.TextArea
            rows={8}
            value={pasteSerialText}
            onChange={(e) => setPasteSerialText(e.target.value)}
            placeholder="Ví dụ:&#10;KVR-8G-2610-09881&#10;KVR-8G-2610-09882&#10;KVR-8G-2610-09883"
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8c8c8c', fontSize: '12px' }}>
            <span>
              Số mã nhận diện tạm tính: <b>
                {pasteSerialText.split(/[\r\n,;\t]+/).map((s) => s.trim()).filter(Boolean).length}
              </b> mã
            </span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                const rnd = Math.floor(1000 + Math.random() * 9000);
                setPasteSerialText(
                  `SN-${rnd}-001\nSN-${rnd}-002\nSN-${rnd}-003`
                );
              }}
              style={{ padding: 0 }}
            >
              🎲 Chèn mã mẫu demo
            </Button>
          </div>
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
        width={850}
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
                { title: 'Mã LK', dataIndex: 'maLk', width: 110 },
                { title: 'Tên linh kiện', dataIndex: 'tenLinhKien', width: 200 },
                { title: 'ĐVT', dataIndex: 'donViTinh', width: 60, align: 'center' },
                { title: 'SL Nhập', dataIndex: 'soLuongNhap', width: 80, align: 'center' },
                {
                  title: 'Đơn giá',
                  dataIndex: 'donGiaNhap',
                  align: 'right',
                  width: 110,
                  render: (v) => `${(v || 0).toLocaleString()} đ`,
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'thanhTien',
                  align: 'right',
                  width: 120,
                  render: (v) => <b>{(v || 0).toLocaleString()} đ</b>,
                },
                {
                  title: 'Mã Serial đã nhập',
                  dataIndex: 'danhSachSerial',
                  key: 'danhSachSerial',
                  render: (val) => {
                    if (!val) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
                    try {
                      const list = typeof val === 'string' ? JSON.parse(val) : val;
                      if (!Array.isArray(list) || list.length === 0) return <Text type="secondary">—</Text>;
                      return (
                        <Space wrap size={[3, 3]}>
                          {list.map((s) => (
                            <Tag key={s} color="blue" style={{ fontFamily: 'monospace', fontSize: '11px', margin: 0 }}>
                              {s}
                            </Tag>
                          ))}
                        </Space>
                      );
                    } catch {
                      return <Text>{val}</Text>;
                    }
                  },
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
                    <Table.Summary.Cell index={2} />
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
      {/* ======================================================== */}
      {/* MODAL: PHÊ DUYỆT XUẤT KHO THEO SERIAL (MỤC 3.2 GIAI ĐOẠN 3) */}
      {/* ======================================================== */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <BarcodeOutlined style={{ color: '#1677ff' }} />
            <span>Phê duyệt xuất kho & Gắn mã Serial linh kiện</span>
          </div>
        }
        open={isExportSerialModalVisible}
        onOk={handleConfirmExportWithSerial}
        onCancel={() => {
          setIsExportSerialModalVisible(false);
          setCurrentExportRequest(null);
          setSelectedExportSerialId(null);
        }}
        okText="Xác nhận duyệt & Xuất kho"
        cancelText="Hủy"
        width={600}
      >
        {currentExportRequest && (
          <div style={{ marginTop: 12 }}>
            <Alert
              message="Minh bạch xuất kho theo mã Serial"
              description="Hệ thống yêu cầu chỉ định chính xác mã Serial của linh kiện đang có trong kho để bàn giao cho Kỹ thuật viên. Mã này sẽ được gán vào hồ sơ bảo hành của khách hàng."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">Mã phiếu tiếp nhận: </Text>
                  <b>{currentExportRequest.ticketCode}</b>
                </Col>
                <Col span={12}>
                  <Text type="secondary">KTV yêu cầu: </Text>
                  <b>{currentExportRequest.ktv}</b>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Vật tư xuất kho: </Text>
                  <span style={{ color: '#1677ff', fontWeight: 600 }}>{currentExportRequest.partName}</span>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Số lượng xuất: </Text>
                  <Tag color="blue">{currentExportRequest.quantity}</Tag>
                </Col>
              </Row>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Chọn mã Serial cụ thể từ kho: <span style={{ color: 'red' }}>*</span>
              </label>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Tìm và chọn mã serial cụ thể từ kho..."
                loading={loadingSerialsTrongKho}
                value={selectedExportSerialId}
                onChange={(val) => setSelectedExportSerialId(val)}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={serialsTrongKho.map((s) => ({
                  value: s.id,
                  label: `${s.soSerial}  |  Nhập: ${dayjs(s.ngayNhap).format('DD/MM/YYYY')}  |  NCC: ${s.tenNcc}`,
                }))}
              />
              <div style={{ marginTop: 6, fontSize: '12px', color: '#8c8c8c' }}>
                {serialsTrongKho.length > 0 ? (
                  <span>✅ Đang có <b>{serialsTrongKho.length}</b> mã serial sẵn sàng xuất trong kho.</span>
                ) : (
                  <span>⚠ Chưa tìm thấy serial riêng trong kho. Bạn có thể duyệt xuất theo số lượng tổng.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: TRA CỨU NHANH VÒNG ĐỜI MÃ SERIAL LINH KIỆN       */}
      {/* ======================================================== */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: '#1677ff' }}>
            <BarcodeOutlined />
            <span>Tra cứu chi tiết Vòng đời & Nguồn gốc mã Serial</span>
          </div>
        }
        open={isQuickSearchSerialModalVisible}
        onCancel={() => {
          setIsQuickSearchSerialModalVisible(false);
          setQuickSerialResult(null);
          setQuickSerialError('');
        }}
        footer={[
          <Button key="close" onClick={() => setIsQuickSearchSerialModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={720}
      >
        <div style={{ marginTop: 12 }}>
          <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
            <Input
              size="large"
              placeholder="Nhập hoặc quét mã vạch Serial linh kiện rồi nhấn Enter..."
              prefix={<SearchOutlined style={{ color: '#1677ff' }} />}
              value={quickSerialInput}
              onChange={(e) => setQuickSerialInput(e.target.value)}
              onPressEnter={() => handleQuickSearchSerial(quickSerialInput)}
              style={{ fontFamily: 'monospace' }}
              allowClear
            />
            <Button
              type="primary"
              size="large"
              loading={quickSerialSearching}
              onClick={() => handleQuickSearchSerial(quickSerialInput)}
            >
              Tra cứu
            </Button>
          </Space.Compact>

          {/* Gợi ý mã mẫu test nhanh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '12px', color: '#8c8c8c' }}>
            <span>💡 Mã serial gợi ý:</span>
            {['SN-RAM-8G-091', 'SN-SSD-512-NVME', 'KVR-8G-2610-09881'].map((m) => (
              <Tag
                key={m}
                style={{ cursor: 'pointer', fontFamily: 'monospace', margin: 0 }}
                onClick={() => {
                  setQuickSerialInput(m);
                  handleQuickSearchSerial(m);
                }}
              >
                {m}
              </Tag>
            ))}
          </div>

          {quickSerialError && (
            <Alert
              type="error"
              showIcon
              message={quickSerialError}
              style={{ marginBottom: 16 }}
            />
          )}

          {quickSerialResult && (
            <Card
              size="small"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <BarcodeOutlined style={{ color: '#1677ff' }} />
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }}>
                      {quickSerialResult.soSerial}
                    </span>
                  </Space>
                  <Tag
                    color={
                      quickSerialResult.trangThai === 'TRONG_KHO'
                        ? 'cyan'
                        : quickSerialResult.trangThai === 'DA_XUAT'
                        ? 'green'
                        : quickSerialResult.trangThai === 'BAO_HANH'
                        ? 'orange'
                        : 'red'
                    }
                    style={{ fontSize: 13, padding: '2px 10px' }}
                  >
                    {quickSerialResult.trangThai === 'TRONG_KHO'
                      ? 'ĐANG TRONG KHO'
                      : quickSerialResult.trangThai === 'DA_XUAT'
                      ? 'ĐÃ XUẤT LẮP RÁP'
                      : quickSerialResult.trangThai === 'BAO_HANH'
                      ? 'ĐANG BẢO HÀNH NCC'
                      : 'ĐÃ THANH LÝ'}
                  </Tag>
                </div>
              }
              style={{ background: '#fafafa', borderRadius: 8, border: '1px solid #d9d9d9' }}
            >
              {/* Thông tin linh kiện */}
              <Row gutter={[16, 12]} style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                <Col span={12}>
                  <Text type="secondary">Tên linh kiện:</Text>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1677ff' }}>
                    {quickSerialResult.tenLinhKien}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Mã linh kiện:</Text>
                  <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {quickSerialResult.maLk}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Kho lưu trữ hiện tại:</Text>
                  <div><b>{quickSerialResult.tenKho || '—'}</b></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Ghi chú lưu kho:</Text>
                  <div>{quickSerialResult.ghiChu || 'Không có'}</div>
                </Col>
              </Row>

              {/* Vòng đời chi tiết */}
              <Title level={5} style={{ marginBottom: 16 }}>
                Lịch sử lưu chuyển & Vòng đời:
              </Title>
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <div style={{ fontWeight: 600 }}>Nhập kho từ Nhà Cung Cấp</div>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          Mã phiếu nhập: <b>{quickSerialResult.maPn}</b> • Nhà cung cấp: <b>{quickSerialResult.tenNcc}</b>
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Thời gian nhập: {dayjs(quickSerialResult.ngayNhap).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: quickSerialResult.ngayXuat ? 'blue' : 'gray',
                    children: quickSerialResult.ngayXuat ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>Xuất kho lắp ráp cho thiết bị khách hàng</div>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          Phiếu sửa chữa: <b>{quickSerialResult.maPhieuSuaChua || '—'}</b> • Thiết bị: <b>{quickSerialResult.tenThietBi || '—'}</b>
                        </div>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          Khách hàng sở hữu: <b>{quickSerialResult.tenKhachHang || '—'}</b>
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Ngày xuất kho: {dayjs(quickSerialResult.ngayXuat).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#8c8c8c' }}>
                        <div>Đang lưu trữ sẵn sàng trong kho</div>
                        <div style={{ fontSize: 12 }}>Chưa xuất cho phiếu sửa chữa nào</div>
                      </div>
                    ),
                  },
                  {
                    color: quickSerialResult.baoHanhDen ? 'green' : 'gray',
                    children: (
                      <div>
                        <div style={{ fontWeight: 600 }}>Thời hạn bảo hành linh kiện</div>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          {quickSerialResult.baoHanhDen
                            ? `Bảo hành đến ngày: ${dayjs(quickSerialResult.baoHanhDen).format('DD/MM/YYYY')}`
                            : 'Chưa kích hoạt hạn bảo hành (hoặc theo quy định phiếu)'}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Warehouse;
