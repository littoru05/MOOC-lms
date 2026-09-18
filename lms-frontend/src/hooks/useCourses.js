import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import { quizApi } from '../api/quizApi';
import { COURSES } from '../mocks/courses';

/**
 * 1. Query lấy danh sách toàn bộ khóa học đã xuất bản (Public)
 * Tự động đồng bộ với Mock Metadata nếu có và cache trong 5 phút.
 */
export function usePublishedCourses(params) {
  return useQuery({
    queryKey: ['courses', 'published', params],
    queryFn: async () => {
      try {
        const res = await courseApi.getPublishedCourses(params);
        if (res.data && res.data.length > 0) {
          const merged = res.data.map((apiCourse) => {
            const richMatch = COURSES.find(
              (sc) =>
                String(sc.slug).toLowerCase() === String(apiCourse.slug).toLowerCase() ||
                String(sc.id) === String(apiCourse.id)
            );
            return richMatch ? { ...richMatch, ...apiCourse } : apiCourse;
          });

          const allCourses = [...merged];
          COURSES.forEach((sc) => {
            if (
              !allCourses.some(
                (c) =>
                  String(c.slug).toLowerCase() === String(sc.slug).toLowerCase() ||
                  String(c.id) === String(sc.id)
              )
            ) {
              allCourses.push(sc);
            }
          });
          return allCourses;
        }
        return COURSES;
      } catch (err) {
        console.warn('Dùng dữ liệu khóa học chuẩn hóa nội bộ:', err);
        return COURSES;
      }
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
