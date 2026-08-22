import client from './client';

export const certificateApi = {
  // Tra cứu công khai bằng mã băm UUID
  verifyCertificate: (code) => client.get(`/api/v1/certificates/verify/${code}`),
  
  // Lấy chứng chỉ theo lượt ghi danh
  getCertificateByEnrollment: (enrollmentId) => client.get(`/api/v1/certificates/enrollment/${enrollmentId}`),
};
