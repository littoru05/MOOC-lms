import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';

/**
 * Hook lấy danh sách học viên và tiến độ học tập theo khóa học của Giảng viên
 * @param {number|string} courseId 'all' hoặc id khóa học cụ thể
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

export default useInstructorStudents;
