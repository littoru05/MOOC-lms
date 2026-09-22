import { useQuery } from '@tanstack/react-query';
import { revenueApi } from '../api/revenueApi';
import { useAuth } from '../context/AuthContext';

/**
 * 1. Hook lấy dữ liệu tổng quan doanh thu giảng viên
 */
export function useRevenueSummary() {
  const { token, isInstructor, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['instructor-revenue-summary'],
    queryFn: async () => {
      const res = await revenueApi.getSummary();
      return res.data;
    },
    enabled: Boolean(token) && (isInstructor || isAdmin),
    staleTime: 60 * 1000,
  });
}

/**
 * 2. Hook lấy dữ liệu biểu đồ doanh thu theo thời gian
 * @param {string} groupBy 'day' | 'month' | 'year'
 * @param {{ from?: string, to?: string }} dateRange
 */
export function useRevenueChart(groupBy = 'month', dateRange = {}) {
  const { token, isInstructor, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['instructor-revenue-chart', groupBy, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const params = {
        groupBy,
        ...(dateRange?.from ? { from: dateRange.from } : {}),
        ...(dateRange?.to ? { to: dateRange.to } : {}),
      };
      const res = await revenueApi.getChart(params);
      return res.data || [];
    },
    enabled: Boolean(token) && (isInstructor || isAdmin),
    staleTime: 60 * 1000,
  });
}

/**
 * 3. Hook lấy doanh thu chi tiết theo từng khóa học
 */
export function useRevenueByCourse() {
  const { token, isInstructor, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['instructor-revenue-courses'],
    queryFn: async () => {
      const res = await revenueApi.getCourses();
      return res.data || [];
    },
    enabled: Boolean(token) && (isInstructor || isAdmin),
    staleTime: 60 * 1000,
  });
}
