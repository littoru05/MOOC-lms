import { API_BASE_URL } from '../api/client';

/**
 * Chuẩn hóa URL hình ảnh:
 * - Nếu là URL tuyệt đối (http://, https://, blob:, data:), giữ nguyên.
 * - Nếu là đường dẫn nội bộ (/api/v1/files/...), tự động nối với API_BASE_URL.
 * - Nếu rỗng/null/undefined, trả về fallback.
 */
export function getImageUrl(path, fallback = '') {
  if (!path) return fallback;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  const cleanBase = (API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
