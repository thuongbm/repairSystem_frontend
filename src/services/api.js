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

export const api = {
  login: async (username, password) => {
    const res = await client.post('/Auth/login', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await client.get('/Auth/me');
    return res.data;
  },
  getUsers: async () => {
    const res = await client.get('/Users');
    return res.data;
  },
  createUser: async (userData) => {
    const res = await client.post('/Users', userData);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await client.delete(`/Users/${id}`);
    return res.data;
  },
};