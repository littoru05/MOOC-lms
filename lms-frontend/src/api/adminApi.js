import client from './client';

export const adminApi = {
  // Course approvals
  getPendingCourses: () => client.get('/api/v1/admin/courses/pending'),
  approveCourse: (id) => client.patch(`/api/v1/admin/courses/${id}/approve`),
  rejectCourse: (id, reason) => client.patch(`/api/v1/admin/courses/${id}/reject`, reason ? { reason } : {}),

  // User management
  getAllUsers: () => client.get('/api/v1/admin/users'),
  toggleUserActive: (id) => client.patch(`/api/v1/admin/users/${id}/toggle-active`),
  getUserDetail: (id) => client.get(`/api/v1/admin/users/${id}/detail`),
  revealSensitiveInfo: (id, adminPassword) => client.post(`/api/v1/admin/users/${id}/reveal`, { adminPassword }),
  resetUserPassword: (id, adminPassword) => client.post(`/api/v1/admin/users/${id}/reset-password`, { adminPassword }),

  // Dashboard Stats
  getDashboardStats: () => client.get('/api/v1/admin/stats'),
};
