import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 0, // Disable timeout for uploads
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthRequest = config.url?.includes('/auth/register') || config.url?.includes('/auth/login');

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API; // Xuất khẩu mặc định
