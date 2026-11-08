import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm token nếu đã đăng nhập
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý tự động khi token hết hạn (401)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Chỉ xoá và chuyển hướng nếu không phải đang gọi API login
      if (!error.config.url.toLowerCase().includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('techfix_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  taoKhoV3: async (payload) =>
    (await client.post('/v3/kho', payload)).data,
  // Auth
  login: async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    return res.data;
  },
  register: async (payload) => {
    const res = await client.post('/auth/register', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },
  capMaLienKetKhach: async (id) => (await client.post(`/khach-hang/${id}/ma-lien-ket`)).data,
  timKhachTheoDienThoai: async (soDienThoai) =>
    (await client.get('/khach-hang', { params: { soDienThoai } })).data,
  getPhieuCuaToi: async () => (await client.get('/khach-hang/me/phieu-sua-chua')).data,
  getChiTietPhieuCuaToi: async (id) => (await client.get(`/khach-hang/me/phieu-sua-chua/${id}`)).data,
  getBaoHanhCuaToi: async () => (await client.get('/khach-hang/me/bao-hanh')).data,
  phanHoiBaoGiaKhach: async (id, payload) =>
    (await client.post(`/khach-hang/me/bao-gia/${id}/phan-hoi`, payload)).data,
  datLichHen: async (payload) => (await client.post('/lich-hen', payload)).data,
  getLichHenCuaToi: async () => (await client.get('/lich-hen/me')).data,
  huyLichHen: async (id) => (await client.post(`/lich-hen/${id}/huy`)).data,
  getLichHen: async (params) => (await client.get('/lich-hen', { params })).data,
  doiTrangThaiLichHen: async (id, payload) => (await client.patch(`/lich-hen/${id}/trang-thai`, payload)).data,
  phanCongPhieu: async (id, payload) => (await client.patch(`/phieu-sua-chua/${id}/phan-cong`, payload)).data,
  doiHenTraPhieu: async (id, payload) => (await client.patch(`/phieu-sua-chua/${id}/hen-tra`, payload)).data,
  getAnhPhieu: async (id) => (await client.get(`/phieu-sua-chua/${id}/anh`)).data,
  getAnhPhieuFile: async (id, anhId) =>
    (await client.get(`/phieu-sua-chua/${id}/anh/${anhId}`, { responseType: 'blob' })).data,
  taiAnhPhieu: async (id, formData) =>
    (await client.post(`/phieu-sua-chua/${id}/anh`, formData,
      { headers: { 'Content-Type': undefined } })).data,
  xoaAnhPhieu: async (id, anhId) => (await client.delete(`/phieu-sua-chua/${id}/anh/${anhId}`)).data,
  getXacNhanTiepNhan: async (id) =>
    (await client.get(`/phieu-sua-chua/${id}/xac-nhan-tiep-nhan`)).data,
  xacNhanTiepNhan: async (id, payload) =>
    (await client.post(`/phieu-sua-chua/${id}/xac-nhan-tiep-nhan`, payload)).data,
  getQuyTacVanHanh: async () => (await client.get('/v3/quy-tac-van-hanh')).data,
  capNhatQuyTacVanHanh: async (payload) =>
    (await client.put('/v3/quy-tac-van-hanh', payload)).data,
  refreshToken: async (refreshToken) => {
    const res = await client.post('/auth/refresh-token', { refreshToken });
    return res.data;
  },
  getKhungGioLichHen: async (ngay) =>
    (await client.get('/lich-hen/khung-gio', { params: { ngay } })).data,

  // Danh mục Phase 0 & Quản trị nhân sự
  getNhanVien: async (params) => {
    const res = await client.get('/nhan-vien', { params });
    return res.data;
  },
  getNhanVienById: async (id) => {
    const res = await client.get(`/nhan-vien/${id}`);
    return res.data;
  },
  taoNhanVien: async (payload) => {
    const res = await client.post('/nhan-vien', payload);
    return res.data;
  },
  capNhatNhanVien: async (id, payload) => {
    const res = await client.put(`/nhan-vien/${id}`, payload);
    return res.data;
  },
  xoaNhanVien: async (id) => {
    const res = await client.delete(`/nhan-vien/${id}`);
    return res.data;
  },

  // Quản trị tài khoản người dùng
  getUsers: async () => {
    const res = await client.get('/users');
    return res.data;
  },
  getUserByUsername: async (username) =>
    (await client.get(`/users/by-username/${encodeURIComponent(username)}`)).data,
  datLaiMatKhau: async (id, payload) =>
    (await client.post(`/users/${id}/reset-password`, payload)).data,
  capNhatTrangThaiTaiKhoan: async (taiKhoanId, isActive) => {
    const res = await client.put(`/users/${taiKhoanId}/status`, { isActive });
    return res.data;
  },
  getDichVu: async () => {
    const res = await client.get('/dich-vu');
    return res.data;
  },
  taoDichVu: async (payload) => (await client.post('/dich-vu', payload)).data,
  capNhatDichVu: async (id, payload) => (await client.put(`/dich-vu/${id}`, payload)).data,
  xoaDichVu: async (id) => (await client.delete(`/dich-vu/${id}`)).data,
  getNhaCungCap: async (params) => {
    const res = await client.get('/nha-cung-cap', { params });
    return res.data;
  },
  taoNhaCungCap: async (payload) => (await client.post('/nha-cung-cap', payload)).data,
  getLinhKien: async (params) => {
    const res = await client.get('/linh-kien', { params });
    return res.data;
  },
  getLoaiLinhKienV3: async () => (await client.get('/v3/loai-linh-kien')).data,
  taoLoaiLinhKienV3: async (payload) => (await client.post('/v3/loai-linh-kien', payload)).data,
  capNhatLoaiLinhKienV3: async (id, payload) =>
    (await client.put(`/v3/loai-linh-kien/${id}`, payload)).data,
  taoThuocTinhLinhKienV3: async (loaiId, payload) =>
    (await client.post(`/v3/loai-linh-kien/${loaiId}/thuoc-tinh`, payload)).data,
  capNhatThuocTinhLinhKienV3: async (id, payload) =>
    (await client.put(`/v3/loai-linh-kien/thuoc-tinh/${id}`, payload)).data,
  taoLuaChonLinhKienV3: async (thuocTinhId, payload) =>
    (await client.post(`/v3/loai-linh-kien/thuoc-tinh/${thuocTinhId}/lua-chon`, payload)).data,
  capNhatLuaChonLinhKienV3: async (id, payload) =>
    (await client.put(`/v3/loai-linh-kien/lua-chon/${id}`, payload)).data,
  taoMauLinhKienV3: async (payload) => (await client.post('/v3/mau-linh-kien', payload)).data,
  getMauLinhKienV3: async (id) => (await client.get(`/v3/mau-linh-kien/${id}`)).data,
  capNhatMauLinhKienV3: async (id, payload) =>
    (await client.put(`/v3/mau-linh-kien/${id}`, payload)).data,
  getYeuCauVatTuV3: async (phieuId) =>
    (await client.get(`/v3/phieu-sua-chua/${phieuId}/vat-tu/yeu-cau`)).data,
  taoYeuCauVatTuV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/vat-tu/yeu-cau`, payload)).data,
  duyetYeuCauVatTuV3: async (phieuId, id, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/vat-tu/yeu-cau/${id}/duyet`, payload)).data,
  traVatTuV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/vat-tu/tra-kho`, payload)).data,
  getBaoGiaV3: async (phieuId) =>
    (await client.get(`/v3/phieu-sua-chua/${phieuId}/bao-gia`)).data,
  getDichVuPhieuV3: async (phieuId) =>
    (await client.get(`/v3/phieu-sua-chua/${phieuId}/dich-vu`)).data,
  themDichVuPhieuV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/dich-vu`, payload)).data,
  taoBaoGiaV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/bao-gia`, payload)).data,
  guiBaoGiaV3: async (phieuId, id) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/bao-gia/${id}/gui`)).data,
  phanHoiBaoGiaV3: async (phieuId, id, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/bao-gia/${id}/phan-hoi`, payload)).data,
  getTaiChinhV3: async (phieuId) =>
    (await client.get(`/v3/phieu-sua-chua/${phieuId}/tai-chinh`)).data,
  lapHoaDonV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/hoa-don`, payload)).data,
  ghiGiaoDichV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/giao-dich`, payload)).data,
  banGiaoV3: async (phieuId, payload) =>
    (await client.post(`/v3/phieu-sua-chua/${phieuId}/ban-giao`, payload)).data,
  getBaoHanhKhachV3: async (params) =>
    (await client.get('/v3/bao-hanh/khach', { params })).data,
  getCamKetBaoHanhV3: async (phieuId) =>
    (await client.get(`/v3/bao-hanh/cam-ket/${phieuId}`)).data,
  taoCamKetBaoHanhV3: async (payload) =>
    (await client.post('/v3/bao-hanh/cam-ket', payload)).data,
  doiTrangThaiBaoHanhKhachV3: async (id, payload) =>
    (await client.post(`/v3/bao-hanh/khach/${id}/trang-thai`, payload)).data,
  taoBaoHanhKhachV3: async (payload) =>
    (await client.post('/v3/bao-hanh/khach', payload)).data,
  duyetBaoHanhLapV3: async (id, payload) =>
    (await client.post(`/v3/bao-hanh/khach/${id}/duyet-lap-lai`, payload)).data,
  getBaoHanhNccV3: async (params) =>
    (await client.get('/v3/bao-hanh/nha-cung-cap', { params })).data,
  taoBaoHanhNccV3: async (payload) =>
    (await client.post('/v3/bao-hanh/nha-cung-cap', payload)).data,
  guiBaoHanhNccV3: async (id, payload) =>
    (await client.post(`/v3/bao-hanh/nha-cung-cap/${id}/gui`, payload)).data,
  nhanLaiBaoHanhNccV3: async (id, payload) =>
    (await client.post(`/v3/bao-hanh/nha-cung-cap/${id}/nhan-lai`, payload)).data,
  xuLyKhoBaoHanhNccV3: async (id, payload) =>
    (await client.post(`/v3/bao-hanh/nha-cung-cap/${id}/xu-ly-kho`, payload)).data,

  // Kho & Tồn kho (Giai đoạn 1)
  getKho: async () => {
    const res = await client.get('/kho');
    return res.data;
  },
  getTonKho: async (params) => {
    const res = await client.get('/kho/ton-kho', { params });
    return res.data;
  },
  getCanhBaoTonKho: async (khoId) => {
    const res = await client.get('/kho/canh-bao-het-hang', { params: khoId ? { khoId } : {} });
    return res.data;
  },
  capNhatMucTonToiThieu: async (khoId, linhKienId, mucTonToiThieu) => {
    const res = await client.put(`/kho/ton-kho/${khoId}/${linhKienId}/muc-ton-toi-thieu`, { mucTonToiThieu });
    return res.data;
  },

  // Phiếu nhập kho (Giai đoạn 1)
  taoPhieuNhap: async (payload) => {
    const res = await client.post('/phieu-nhap/tao-moi', payload);
    return res.data;
  },
  getPhieuNhap: async (params) => {
    const res = await client.get('/phieu-nhap', { params });
    return res.data;
  },
  getPhieuNhapById: async (id) => {
    const res = await client.get(`/phieu-nhap/${id}`);
    return res.data;
  },
  xacNhanPhieuNhap: async (id) => {
    const res = await client.post(`/phieu-nhap/${id}/xac-nhan`);
    return res.data;
  },
  huyPhieuNhap: async (id) => {
    const res = await client.post(`/phieu-nhap/${id}/huy`);
    return res.data;
  },

  // Linh kiện serial (Giai đoạn 1 nâng cao - Quản lý số Serial)
  getLinhKienSerials: async (params) => {
    const res = await client.get('/linh-kien-serial', { params });
    return res.data;
  },
  traCuuSerial: async (soSerial) => {
    const res = await client.get(`/linh-kien-serial/${encodeURIComponent(soSerial)}/tracuu`);
    return res.data;
  },
  traCuuBaoHanhSerial: async (soSerial) => {
    const res = await client.get(`/linh-kien-serial/bao-hanh/${encodeURIComponent(soSerial)}`);
    return res.data;
  },
  getKiemKeKhoV3: async (params) => (await client.get('/v3/kiem-ke-kho', { params })).data,
  getChiTietKiemKeKhoV3: async (id) => (await client.get(`/v3/kiem-ke-kho/${id}`)).data,
  taoKiemKeKhoV3: async (payload) => (await client.post('/v3/kiem-ke-kho', payload)).data,
  duyetKiemKeKhoV3: async (id, payload) =>
    (await client.post(`/v3/kiem-ke-kho/${id}/duyet`, payload)).data,
  getCachLyVatTuV3: async (params) => (await client.get('/v3/cach-ly-vat-tu', { params })).data,
  taoCachLyVatTuV3: async (payload) => (await client.post('/v3/cach-ly-vat-tu', payload)).data,
  xuLyCachLyVatTuV3: async (id, payload) =>
    (await client.post(`/v3/cach-ly-vat-tu/${id}/xu-ly`, payload)).data,
  // Xuất kho linh kiện cho phiếu sửa chữa (Thủ kho). payload: { khoId, linhKienId, soLuong, linhKienSerialIds }
  xuatKhoPhieu: async (phieuId, payload) => {
    const res = await client.post(`/phieu-sua-chua/${phieuId}/xuat-kho`, payload);
    return res.data;
  },
  getXuatKhoPhieu: async (phieuId) => {
    const res = await client.get(`/phieu-sua-chua/${phieuId}/xuat-kho`);
    return res.data;
  },

  // Phiếu sửa chữa (Tiếp nhận thiết bị - Giai đoạn 3)
  taoPhieuSuaChua: async (payload) => {
    const res = await client.post('/phieu-sua-chua', payload);
    return res.data;
  },
  getPhieuSuaChua: async (params) => {
    const res = await client.get('/phieu-sua-chua', { params });
    return res.data;
  },
  traCuuThietBiTheoSerial: async (serial) =>
    (await client.get('/phieu-sua-chua/tra-cuu-thiet-bi', { params: { serial } })).data,
  getChiTietPhieuSuaChua: async (id) =>
    (await client.get(`/phieu-sua-chua/${id}`)).data,
  xacNhanNhanMay: async (id) =>
    (await client.post(`/phieu-sua-chua/${id}/nhan-may`)).data,
  luuKetQuaKiemTra: async (id, ketQuaKiemTra) =>
    (await client.patch(`/phieu-sua-chua/${id}/kiem-tra`, { ketQuaKiemTra })).data,
  getCongViecSuaChuaV3: async (params) =>
    (await client.get('/v3/cong-viec-sua-chua', { params })).data,
  taoCongViecSuaChuaV3: async (payload) =>
    (await client.post('/v3/cong-viec-sua-chua', payload)).data,
  batDauCongViecV3: async (id) =>
    (await client.post(`/v3/cong-viec-sua-chua/${id}/bat-dau`)).data,
  huyCongViecV3: async (id, payload) =>
    (await client.post(`/v3/cong-viec-sua-chua/${id}/huy`, payload)).data,
  hoanThanhCongViecV3: async (id, payload) =>
    (await client.post(`/v3/cong-viec-sua-chua/${id}/hoan-thanh`, payload)).data,
  deXuatCongV3: async (id, payload) =>
    (await client.post(`/v3/cong-viec-sua-chua/${id}/de-xuat-cong`, payload)).data,
  duyetCongV3: async (id, payload) =>
    (await client.post(`/v3/cong-viec-sua-chua/${id}/duyet-cong`, payload)).data,
  chiTraCongV3: async (id, payload) =>
    (await client.post(`/v3/cong-viec-sua-chua/${id}/chi-tra`, payload)).data,
  phanTichChiPhiBaoHanhV3: async (id, payload) =>
    (await client.put(`/v3/bao-hanh/khach/${id}/phan-tich-chi-phi`, payload)).data,
  lienKetPhieuSuaBaoHanhV3: async (id, payload) =>
    (await client.patch(`/v3/bao-hanh/khach/${id}/lien-ket-phieu-sua`, payload)).data,
  deXuatXuLyVatTuV3: async (id, payload) =>
    (await client.post(`/v3/cach-ly-vat-tu/${id}/de-xuat`, payload)).data,
  getTaiLieuThanhLyV3: async (id) =>
    (await client.get(`/v3/cach-ly-vat-tu/${id}/tai-lieu`)).data,
  getTaiLieuThanhLyFileV3: async (id, fileId) =>
    (await client.get(`/v3/cach-ly-vat-tu/${id}/tai-lieu/${fileId}`,
      { responseType: 'blob' })).data,
  taiTaiLieuThanhLyV3: async (id, formData) =>
    (await client.post(`/v3/cach-ly-vat-tu/${id}/tai-lieu`, formData,
      { headers: { 'Content-Type': undefined } })).data,
  duyetXuLyVatTuV3: async (id, payload) =>
    (await client.post(`/v3/cach-ly-vat-tu/${id}/duyet`, payload)).data,
  getHoaDonDauVaoV3: async (params) =>
    (await client.get('/v3/chung-tu/dau-vao', { params })).data,
  ghiHoaDonDauVaoV3: async (payload) =>
    (await client.post('/v3/chung-tu/dau-vao', payload)).data,
  getHoaDonDienTuV3: async (params) =>
    (await client.get('/v3/chung-tu/dau-ra', { params })).data,
  ghiHoaDonDienTuV3: async (payload) =>
    (await client.post('/v3/chung-tu/dau-ra', payload)).data,
  ghiDieuChinhHoaDonV3: async (id, payload) =>
    (await client.post(`/v3/chung-tu/dau-ra/${id}/dieu-chinh`, payload)).data,
  getDoiSoatTaiChinhV3: async () =>
    (await client.get('/v3/chung-tu/doi-soat')).data,
  // Danh sách KTV kèm số ca đang làm (Admin, Lễ tân) để phân công khi tiếp nhận
  getKyThuatVienPhanCong: async () => {
    const res = await client.get('/phieu-sua-chua/ky-thuat-vien');
    return res.data;
  },
  // payload: { trangThai, ghiChu, lyDoHuy, ketQuaSuaChua }
  capNhatTrangThaiPhieu: async (id, payload) => {
    const res = await client.put(`/phieu-sua-chua/${id}/trang-thai`, payload);
    return res.data;
  },
};

export default client;
