import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import { quizApi } from '../api/quizApi';

/**
 * 1. Query lấy danh sách toàn bộ khóa học đã xuất bản (Public)
 * Lấy trực tiếp từ Backend API và cache trong 5 phút.
 */
export function usePublishedCourses(params) {
  return useQuery({
    queryKey: ['courses', 'published', params],
    queryFn: async () => {
      const res = await courseApi.getPublishedCourses(params);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

/**
 * 2. Query lấy danh mục khóa học
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await courseApi.getCategories();
        if (res.data && res.data.length > 0) {
          return res.data;
        }
      } catch (e) {
        console.warn('Dùng danh mục mặc định:', e);
      }
      return [
        { id: 1, name: 'Lập trình Web', slug: 'lap-trinh-web' },
        { id: 2, name: 'Trí tuệ nhân tạo & Data Science', slug: 'ai-data-science' },
        { id: 3, name: 'Lập trình Di động', slug: 'lap-trinh-di-dong' },
      ];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 3. Query lấy danh sách các khóa học do Giảng viên hiện tại phụ trách
 */
export function useTeachingCourses() {
  return useQuery({
    queryKey: ['courses', 'teaching'],
    queryFn: async () => {
      const res = await courseApi.getMyTeachingCourses();
      return res.data || [];
    },
  });
}

/**
 * 4. Mutation gửi duyệt khóa học (DRAFT -> PENDING)
 * Tự động làm mới cache danh sách khóa học của giảng viên ngay khi thành công.
 */
export function useSubmitForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => courseApi.submitForReview(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation gửi yêu cầu xóa khóa học (Chuyển sang PENDING_DELETE chờ Admin duyệt)
 */
export function useRequestDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => courseApi.requestDeleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation xóa / lưu trữ khóa học (soft delete nếu chưa có ai mua, ARCHIVED nếu đã có học viên)
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => courseApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingCourses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation khôi phục khóa học từ trạng thái Lưu trữ (ARCHIVED -> PUBLISHED)
 */
export function useRestoreCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => courseApi.restoreCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'published'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * 5. Query lấy thông tin chi tiết một khóa học theo ID (cho Instructor / Admin / Student)
 */
export function useCourseDetail(courseId) {
  const isValidId = !isNaN(Number(courseId)) && Number(courseId) > 0;
  return useQuery({
    queryKey: ['courses', 'detail', courseId],
    queryFn: async () => {
      if (!isValidId) return null;
      const res = await courseApi.getCourseById(courseId);
      return res.data;
    },
    enabled: isValidId,
  });
}

/**
 * 6. Mutation cập nhật thông tin khóa học
 * Tự động xóa/làm mới cache toàn bộ ['courses'] sau khi lưu thành công.
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => courseApi.updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', variables.id] });
    },
  });
}

/**
 * 7. Query lấy danh sách đề thi Quiz theo ID khóa học
 */
export function useCourseQuizzes(courseId) {
  const isValidId = !isNaN(Number(courseId)) && Number(courseId) > 0;
  return useQuery({
    queryKey: ['quizzes', 'course', courseId],
    queryFn: async () => {
      if (!isValidId) return [];
      try {
        const res = await quizApi.getQuizzesByCourse(courseId);
        if (!res.data) return [];
        return Array.isArray(res.data) ? res.data : [res.data];
      } catch (e) {
        console.warn('Lỗi tải đề thi Quiz:', e);
        return [];
      }
    },
    enabled: isValidId,
  });
}

/**
 * 8. Query lấy danh sách học viên và tiến độ học tập theo khóa học của Giảng viên
 */
export function useInstructorStudents(courseId) {
  return useQuery({
    queryKey: ['instructor', 'course-students', courseId],
    queryFn: async () => {
      const res = await courseApi.getInstructorCourseProgress(courseId);
      return res.data || [];
    },
    staleTime: 30 * 1000,
  });
}
