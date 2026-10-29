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

  // Danh mục Phase 0
  getNhanVien: async (params) => {
    const res = await client.get('/nhan-vien', { params });
    return res.data;
  },
  getDichVu: async () => {
    const res = await client.get('/dich-vu');
    return res.data;
  },
  getNhaCungCap: async () => {
    const res = await client.get('/nha-cung-cap');
    return res.data;
  },
  getLinhKien: async (params) => {
    const res = await client.get('/linh-kien', { params });
    return res.data;
  },
};

export default client;
