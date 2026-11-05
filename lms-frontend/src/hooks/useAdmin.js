import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

/**
 * 1. Query lấy danh sách các khóa học đang chờ Admin duyệt (PENDING)
 */
export function usePendingCourses() {
  return useQuery({
    queryKey: ['admin', 'pendingCourses'],
    queryFn: async () => {
      const res = await adminApi.getPendingCourses();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 2, // Cache 2 phút
  });
}

/**
 * 2. Mutation phê duyệt khóa học (PENDING -> PUBLISHED)
 * Tự động xóa cache danh sách chờ duyệt và danh sách khóa học public.
 */
export function useApproveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => adminApi.approveCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'published'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

/**
 * 3. Mutation từ chối khóa học (PENDING -> REJECTED)
 */
export function useRejectCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (param) => {
      if (typeof param === 'object' && param !== null) {
        return adminApi.rejectCourse(param.id, param.reason);
      }
      return adminApi.rejectCourse(param);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

/**
 * 4. Query lấy danh sách toàn bộ người dùng hệ thống (Admin)
 */
export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await adminApi.getAllUsers();
      return res.data || [];
    },
  });
}

/**
 * 5. Mutation thay đổi trạng thái kích hoạt tài khoản (Lock/Unlock)
 */
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => adminApi.toggleUserActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/**
 * 6. Query lấy số liệu thống kê Dashboard Admin
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await adminApi.getDashboardStats();
      return res.data || {};
    },
    staleTime: 1000 * 60, // Cache 1 phút
  });
}

// Aliases for compatibility
export const useAdminStats = useDashboardStats;
export const useToggleUserStatus = useToggleUserActive;
