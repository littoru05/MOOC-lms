import client from './client';

export const adminApi = {
  // Course approvals
  getPendingCourses: () => client.get('/api/v1/admin/courses/pending'),
  approveCourse: (id) => client.patch(`/api/v1/admin/courses/${id}/approve`),
  rejectCourse: (id, reason) => client.patch(`/api/v1/admin/courses/${id}/reject`, reason ? { reason } : {}),

  // User management
  getAllUsers: () => client.get('/api/v1/admin/users'),
  toggleUserActive: (id) => client.patch(`/api/v1/admin/users/${id}/toggle-active`),

  // Dashboard Stats
  getDashboardStats: () => client.get('/api/v1/admin/stats'),
};
