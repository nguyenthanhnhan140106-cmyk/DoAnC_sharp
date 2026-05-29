import axios from 'axios';

// 1. Cấu hình địa chỉ gốc (Base URL) dẫn sang Backend C# của nhóm
const API = axios.create({
  baseURL: 'http://localhost:5104/api', // Đúng cổng Port Backend đang chạy hằng ngày
  timeout: 10000, // Nếu quá 10 giây Backend không phản hồi thì tự ngắt để tránh treo web
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Bộ lọc tự động (Interceptor) - Tự động đính kèm Token đăng nhập vào mọi yêu cầu
API.interceptors.request.use(
  (config) => {
    // Tìm xem người dùng có Token đăng nhập (JWT) lưu trong máy không
    const token = localStorage.getItem('token');
    if (token) {
      // Nếu có, tự động nhét vào Header để Backend kiểm tra phân quyền (Admin/Premium)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Bộ lọc phản hồi (Interceptor) - Bắt lỗi tập trung từ Backend trả về
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu Backend báo lỗi 401 (Hết hạn đăng nhập hoặc Token sai)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Xóa token bẩn đi
      window.location.href = '/login'; // Ép người dùng văng ra màn hình Đăng nhập
    }
    return Promise.reject(error);
  }
);

export default API;