import client from './client';

export const auditApi = {
  getInstructorHistory: ({ page = 0, size = 10, action, courseId, from, to } = {}) => {
    const params = { page, size };
    if (action) params.action = action;
    if (courseId) params.courseId = courseId;
    if (from) params.from = from;
    if (to) params.to = to;
    return client.get('/api/v1/instructor/history', { params });
  },
};

export default auditApi;

