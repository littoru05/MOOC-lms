import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import { courseApi } from '../api/courseApi';

/**
 * Hook to fetch paginated instructor audit history
 */
export const useInstructorHistory = ({
  page = 0,
  size = 10,
  action = '',
  courseId = '',
  from = '',
  to = '',
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ['instructor', 'history', { page, size, action, courseId, from, to }],
    queryFn: async () => {
      const response = await auditApi.getInstructorHistory({
        page,
        size,
        action: action || undefined,
        courseId: courseId || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      return response.data || { content: [], totalElements: 0, totalPages: 0, number: 0, size };
    },
    enabled,
    staleTime: 10000,
  });
};

/**
 * Hook to restore course from history and refresh history/courses cache
 */
export const useRestoreCourseFromHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => courseApi.restoreCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

