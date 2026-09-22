import client from './client';

export const adminRevenueApi = {
  // 1. Tổng quan doanh thu sàn
  getOverview: () => client.get('/api/v1/admin/revenue/overview'),

  // 2. Biểu đồ doanh thu theo thời gian
  getChart: (params) => client.get('/api/v1/admin/revenue/chart', { params }),

  // 3. Xếp hạng doanh thu theo Giảng viên
  getByInstructor: () => client.get('/api/v1/admin/revenue/by-instructor'),

  // 4. Top khóa học bán chạy nhất
  getTopCourses: (limit = 10) => client.get('/api/v1/admin/revenue/top-courses', { params: { limit } }),

  // 5. Doanh thu theo danh mục
  getByCategory: () => client.get('/api/v1/admin/revenue/by-category'),

  // 6. Tăng trưởng học viên mới
  getUserGrowth: (groupBy = 'month') => client.get('/api/v1/admin/revenue/growth/users', { params: { groupBy } }),
};

export default adminRevenueApi;
