import client from './client';

export const revenueApi = {
  // Lấy tóm tắt doanh thu (tổng số bán, doanh thu gộp, doanh thu thực nhận, số học viên)
  getSummary: () => client.get('/api/v1/instructor/revenue/summary'),

  // Lấy dữ liệu biểu đồ theo thời gian (groupBy: day | month | year, from, to)
  getChart: (params) => client.get('/api/v1/instructor/revenue/chart', { params }),

  // Lấy doanh thu chi tiết theo từng khóa học
  getCourses: () => client.get('/api/v1/instructor/revenue/courses'),
};
