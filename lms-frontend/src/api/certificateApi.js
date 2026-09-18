import client, { API_BASE_URL } from './client';

export const certificateApi = {
  // Tra cứu công khai bằng mã băm UUID
  verifyCertificate: (code) => client.get(`/api/v1/certificates/verify/${code}`),
  
  // Lấy chứng chỉ theo lượt ghi danh
  getCertificateByEnrollment: (enrollmentId) => client.get(`/api/v1/certificates/enrollment/${enrollmentId}`),

  // Lấy URL tải file chứng chỉ (PDF) trực tiếp
  getDownloadUrl: (code) => {
    const base = (import.meta.env.VITE_API_URL || API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
    return `${base}/api/v1/certificates/download/${encodeURIComponent(code || '')}`;
  },
};

