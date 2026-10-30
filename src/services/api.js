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
  // Auth
  login: async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },
  refreshToken: async (refreshToken) => {
    const res = await client.post('/auth/refresh-token', { refreshToken });
    return res.data;
  },

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
  capNhatTrangThaiTaiKhoan: async (taiKhoanId, isActive) => {
    const res = await client.put(`/users/${taiKhoanId}/status`, { isActive });
    return res.data;
  },
  getDichVu: async () => {
    const res = await client.get('/dich-vu');
    return res.data;
  },
  getNhaCungCap: async (params) => {
    const res = await client.get('/nha-cung-cap', { params });
    return res.data;
  },
  getLinhKien: async (params) => {
    const res = await client.get('/linh-kien', { params });
    return res.data;
  },

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
};

export default client;
