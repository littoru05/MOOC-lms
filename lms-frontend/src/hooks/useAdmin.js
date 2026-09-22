import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';

/**
 * 1. Query lấy danh sách khóa học đang chờ kiểm duyệt (PENDING)
 */
export function usePendingCourses() {
  return useQuery({
    queryKey: ['admin', 'pendingCourses'],
    queryFn: async () => {
      const res = await adminApi.getPendingCourses();
      return res.data || [];
    },
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
    },
  });
}

/**
 * 3. Mutation từ chối khóa học (PENDING -> REJECTED)
 */
export function useRejectCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => adminApi.rejectCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
 * 5. Mutation bật/tắt trạng thái hoạt động của người dùng (isActive)
 */
export function useToggleUserStatus() {
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
 * 6. Query lấy số liệu thống kê Dashboard hệ thống (Admin)
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await adminApi.getDashboardStats();
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}
