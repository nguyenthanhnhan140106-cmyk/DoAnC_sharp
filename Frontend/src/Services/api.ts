import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // 🟢 Hướng chuẩn xác về cổng 5000 của Backend .NET Docker
  timeout: 5000,
});

export default API;