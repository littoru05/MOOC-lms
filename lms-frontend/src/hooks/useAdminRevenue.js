import { useQuery } from '@tanstack/react-query';
import { adminRevenueApi } from '../api/adminRevenueApi';
import { useAuth } from '../context/AuthContext';

/**
 * 1. Hook lấy dữ liệu tổng quan doanh thu toàn sàn cho Admin
 */
export function useAdminRevenueOverview() {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-revenue-overview'],
    queryFn: async () => {
      const res = await adminRevenueApi.getOverview();
      return res.data;
    },
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });
}

/**
 * 2. Hook lấy biểu đồ doanh thu toàn sàn theo thời gian
 * @param {string} groupBy 'day' | 'month' | 'year'
 * @param {{ from?: string, to?: string }} dateRange
 */
export function useAdminRevenueChart(groupBy = 'month', dateRange = {}) {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-revenue-chart', groupBy, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const params = {
        groupBy,
        ...(dateRange?.from ? { from: dateRange.from } : {}),
        ...(dateRange?.to ? { to: dateRange.to } : {}),
      };
      const res = await adminRevenueApi.getChart(params);
      return res.data || [];
    },
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });
}

/**
 * 3. Hook lấy bảng xếp hạng doanh thu theo Giảng viên
 */
export function useInstructorRanking() {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-instructor-ranking'],
    queryFn: async () => {
      const res = await adminRevenueApi.getByInstructor();
      return res.data || [];
    },
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });
}

/**
 * 4. Hook lấy danh sách Top khóa học bán chạy
 * @param {number} limit
 */
export function useTopCourses(limit = 10) {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-top-courses', limit],
    queryFn: async () => {
      const res = await adminRevenueApi.getTopCourses(limit);
      return res.data || [];
    },
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });
}

/**
 * 5. Hook lấy cơ cấu doanh thu theo Danh mục
 */
export function useCategoryRevenue() {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-category-revenue'],
    queryFn: async () => {
      const res = await adminRevenueApi.getByCategory();
      return res.data || [];
    },
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });
}

/**
 * 6. Hook lấy biểu đồ tăng trưởng số học viên mới
 * @param {string} groupBy 'day' | 'month' | 'year'
 */
export function useUserGrowth(groupBy = 'month') {
  const { token, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-user-growth', groupBy],
    queryFn: async () => {
      const res = await adminRevenueApi.getUserGrowth(groupBy);
      return res.data || [];
    },
    enabled: Boolean(token) && isAdmin,
    staleTime: 60 * 1000,
  });
}
