import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL 
  || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? `${window.location.protocol}//${window.location.hostname}:8080`
      : 'http://localhost:8080');

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cho phép tự động gửi và nhận HttpOnly Cookie (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-Memory Access Token (KHÔNG lưu localStorage để phòng chống rò rỉ XSS)
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAccessToken = () => inMemoryAccessToken;

// Request interceptor để đính kèm Token JWT từ In-Memory
client.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mutex & Queue cho Concurrency Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor để xử lý lỗi xác thực 401 và tự động refresh token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu không có phản hồi HTTP hoặc lỗi không phải 401
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url || '';

    // Tránh vòng lặp vô hạn: không thử refresh lại nếu chính request bị 401 là endpoint auth
    const isAuthEndpoint =
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/v1/auth/register') ||
      requestUrl.includes('/api/auth/register') ||
      requestUrl.includes('/api/v1/auth/refresh') ||
      requestUrl.includes('/api/auth/refresh');

    if (isAuthEndpoint || originalRequest?._retry) {
      if (requestUrl.includes('/refresh')) {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:expired', {
              detail: {
                status: 401,
                message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
              },
            })
          );
        }
      }
      return Promise.reject(error);
    }

    // Nếu đã có tiến trình refresh đang chạy, đưa request này vào hàng đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi refresh endpoint trực tiếp qua axios để không bị lặp qua interceptor này
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = res.data?.token;
      if (!newAccessToken) {
        throw new Error('Không nhận được Access Token mới từ máy chủ');
      }

      setAccessToken(newAccessToken);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:refreshed', {
            detail: {
              token: newAccessToken,
              user: res.data,
            },
          })
        );
      }

      // Xử lý các request bị nghẽn trong hàng đợi
      processQueue(null, newAccessToken);

      // Retry request gốc với token mới
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      setAccessToken(null);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:expired', {
            detail: {
              status: 401,
              message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
            },
          })
        );
      }

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;

