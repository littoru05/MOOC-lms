import client from './client';

export const courseApi = {
  // Categories
  getCategories: () => client.get('/api/v1/categories'),
  
  // Public courses
  getPublishedCourses: (params) => client.get('/api/v1/courses/public', { params }),
  getCourseBySlug: (slug) => client.get(`/api/v1/courses/public/${slug}`),

  // Instructor courses
  getMyTeachingCourses: () => client.get('/api/v1/courses/my-teaching'),
  getCourseById: (id) => client.get(`/api/v1/courses/${id}`),
  createCourse: (data) => client.post('/api/v1/courses', data),
  updateCourse: (id, data) => client.put(`/api/v1/courses/${id}`, data),
  submitForReview: (id) => client.post(`/api/v1/courses/${id}/submit-review`),

  // Sections & Lessons
  getSectionsByCourse: (courseId) => client.get(`/api/v1/sections/course/${courseId}`),
  createSection: (data) => client.post('/api/v1/sections', data),
  updateSection: (id, data) => client.put(`/api/v1/sections/${id}`, data),
  deleteSection: (id) => client.delete(`/api/v1/sections/${id}`),

  getLessonsBySection: (sectionId) => client.get(`/api/v1/lessons/section/${sectionId}`),
  getLessonById: (id) => client.get(`/api/v1/lessons/${id}`),
  createLesson: (data) => client.post('/api/v1/lessons', data),
  updateLesson: (id, data) => client.put(`/api/v1/lessons/${id}`, data),
  deleteLesson: (id) => client.delete(`/api/v1/lessons/${id}`),
};
