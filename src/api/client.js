import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để đính kèm Token JWT tự động
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý lỗi xác thực 401 / 403
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_cache');
      if (hadToken) {
        console.warn(`Phiên đăng nhập hết hạn hoặc bị từ chối truy cập (HTTP ${error.response.status}).`);
        window.dispatchEvent(
          new CustomEvent('auth:expired', {
            detail: {
              status: error.response.status,
              message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
            },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default client;

