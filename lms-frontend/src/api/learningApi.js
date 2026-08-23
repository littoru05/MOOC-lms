import client from './client';

export const learningApi = {
  enrollCourse: (courseId) => client.post('/api/v1/enrollments', { courseId }),
  getMyEnrollments: () => client.get('/api/v1/enrollments/my-learning'),
  checkEnrollment: (courseId) => client.get(`/api/v1/enrollments/check/${courseId}`),
  
  // Đánh dấu hoàn thành bài giảng & cập nhật % tiến độ thời gian thực
  completeLesson: (enrollmentId, lessonId) => client.post('/api/v1/learning/complete', { enrollmentId, lessonId }),
  getProgress: (enrollmentId) => client.get(`/api/v1/learning/progress/${enrollmentId}`),
};
