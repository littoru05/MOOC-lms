import client from './client';

export const quizApi = {
  // Instructor tạo bài quiz trọn gói
  createQuiz: (data) => client.post('/api/v1/quizzes', data),

  // Lấy danh sách quiz theo khóa học
  getQuizzesByCourse: (courseId) => client.get(`/api/v1/quizzes/course/${courseId}`),
  getQuizById: (id) => client.get(`/api/v1/quizzes/${id}`),

  // Học viên nộp bài thi
  submitQuiz: (id, data) => client.post(`/api/v1/quizzes/${id}/submit`, data),
};
